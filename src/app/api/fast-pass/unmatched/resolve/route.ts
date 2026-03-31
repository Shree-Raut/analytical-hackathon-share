import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  getTopMemoryCandidatesForHeaders,
  recordMappingSignal,
  completeUnmatchedJob,
} from "@/lib/fast-pass/repositories/learningRepository";
import { callLlm, getLlmConfig, parseJsonResponse } from "@/lib/llm-client";
import {
  buildUnmatchedResolvePrompt,
  normalizeResolveResult,
} from "@/lib/fast-pass/services/unmatchedResolverService";
import { FAST_PASS_CONFIG } from "@/lib/fast-pass/config";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";


interface ResolveRequest {
  headers: string[];
  jobIds?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ResolveRequest;
    const headers = body.headers || [];
    const jobIds = body.jobIds || {};

    if (!headers.length) {
      return apiError("headers array required", 400);
    }

    const cookieStore = await cookies();
    const tenantId = cookieStore.get("activeCustomerId")?.value ?? null;

    const memoryCandidates = await getTopMemoryCandidatesForHeaders(headers, tenantId, 5);

    const syncResults: Array<{
      sourceHeader: string;
      recommendation: string | null;
      confidence: number;
      reason: string;
      candidates: typeof memoryCandidates[string];
      resolvedBy: "bundle_sync" | "llm_async" | "unresolved";
    }> = [];

    const needsLlm: string[] = [];

    for (const header of headers) {
      const candidates = memoryCandidates[header] || [];
      const top = candidates[0];
      if (
        top &&
        top.confidenceScore >= FAST_PASS_CONFIG.unmatched.bundleSyncMinConfidence &&
        top.cursorPriority !== "review"
      ) {
        syncResults.push({
          sourceHeader: header,
          recommendation: top.metricSlug,
          confidence: Math.min(100, Math.round(top.confidenceScore * 8)),
          reason: `Bundle ${top.reason} (${top.cursorPriority}, usage: ${top.evidenceCount})`,
          candidates,
          resolvedBy: "bundle_sync",
        });
        if (jobIds[header]) {
          await completeUnmatchedJob({
            id: jobIds[header],
            recommendationSlug: top.metricSlug,
            recommendationConfidence: Math.min(100, Math.round(top.confidenceScore * 8)),
          });
        }
        await recordMappingSignal({
          tenantId,
          sourceHeader: header,
          metricSlug: top.metricSlug,
          action: "auto_accept",
          source: "unmatched-bundle-sync",
          context: { confidence: top.confidenceScore, reason: top.reason },
        });
      } else {
        needsLlm.push(header);
      }
    }

    if (needsLlm.length > 0) {
      const llmConfig = getLlmConfig({
        modelEnvOrder: ["MESH_MODEL_ID", "LITELLM_MODEL", "OPENAI_MODEL"],
      });

      const metricDefs = await prisma.metricDefinition.findMany({
        where: { isActive: true },
        select: { slug: true, name: true, format: true, category: true },
        take: FAST_PASS_CONFIG.unmatched.metricContextLimit,
      });

      if (llmConfig.apiKey) {
        const llmPayload = needsLlm.map((h) => ({
          sourceHeader: h,
          bundleCandidates: (memoryCandidates[h] || []).slice(0, 3).map((c) => ({
            slug: c.metricSlug,
            score: c.confidenceScore,
            kind: c.fieldKind,
            type: c.dataType,
            definition: c.sourceDescription || "",
          })),
        }));

        const prompt = buildUnmatchedResolvePrompt(
          llmPayload,
          metricDefs.map((m) => ({ slug: m.slug, name: m.name, category: m.category })),
        );

        try {
          const llm = await callLlm(prompt, { config: llmConfig, temperature: 0.1 });
          if (!llm) throw new Error("missing llm");
          const parsed = parseJsonResponse<{ resolutions?: unknown[] }>(llm.text);
          if (parsed) {
            const slugSet = new Set(metricDefs.map((m) => m.slug));
            for (const resolved of normalizeResolveResult(parsed)) {
              const sh = resolved.sourceHeader;
              const ms = resolved.metricSlug;
              const conf = resolved.confidence;
              const reason = resolved.reason;
              if (sh && ms && slugSet.has(ms) && conf >= FAST_PASS_CONFIG.unmatched.llmAcceptanceMinConfidence) {
                syncResults.push({
                  sourceHeader: sh,
                  recommendation: ms,
                  confidence: conf,
                  reason: `LLM: ${reason}`,
                  candidates: memoryCandidates[sh] || [],
                  resolvedBy: "llm_async",
                });
                if (jobIds[sh]) {
                  await completeUnmatchedJob({
                    id: jobIds[sh],
                    recommendationSlug: ms,
                    recommendationConfidence: conf,
                  });
                }
                await recordMappingSignal({
                  tenantId,
                  sourceHeader: sh,
                  metricSlug: ms,
                  action: "auto_accept",
                  source: "unmatched-llm-async",
                  context: { confidence: conf, reason },
                });
              } else if (sh) {
                syncResults.push({
                  sourceHeader: sh,
                  recommendation: null,
                  confidence: 0,
                  reason: ms ? "LLM match below threshold" : "LLM could not resolve",
                  candidates: memoryCandidates[sh] || [],
                  resolvedBy: "unresolved",
                });
                if (jobIds[sh]) {
                  await completeUnmatchedJob({ id: jobIds[sh], error: "llm_no_match" });
                }
              }
            }
          }
        } catch {
          for (const h of needsLlm) {
            syncResults.push({
              sourceHeader: h,
              recommendation: null,
              confidence: 0,
              reason: "LLM call failed",
              candidates: memoryCandidates[h] || [],
              resolvedBy: "unresolved",
            });
          }
        }
      } else {
        for (const h of needsLlm) {
          syncResults.push({
            sourceHeader: h,
            recommendation: null,
            confidence: 0,
            reason: "No LLM key configured",
            candidates: memoryCandidates[h] || [],
            resolvedBy: "unresolved",
          });
        }
      }
    }

    const resolvedCount = syncResults.filter((r) => r.recommendation).length;
    return apiSuccess({
      results: syncResults,
      telemetry: {
        total: headers.length,
        resolvedByBundle: syncResults.filter((r) => r.resolvedBy === "bundle_sync").length,
        resolvedByLlm: syncResults.filter((r) => r.resolvedBy === "llm_async").length,
        unresolved: syncResults.filter((r) => r.resolvedBy === "unresolved").length,
        resolvedCount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    logger.error("fast-pass unmatched resolve failed", {
      route: "/api/fast-pass/unmatched/resolve",
      error: message,
    });
    return apiError("Failed to resolve unmatched columns", 500, message);
  }
}
