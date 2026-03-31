import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { runMappingGraph } from "@/lib/fast-pass/agent/mappingGraph";
import { buildDeterministicMappings } from "@/lib/fast-pass/agent/deterministicMatcher";
import type { MappingResult } from "@/lib/fast-pass/agent/types";
import {
  enqueueUnmatchedColumns,
  getMemoryHintsForHeaders,
  getTopMemoryCandidatesForHeaders,
  recordMappingSignal,
} from "@/lib/fast-pass/repositories/learningRepository";
import { buildMappingCatalog } from "@/lib/fast-pass/services/mappingService";
import { FAST_PASS_CONFIG } from "@/lib/fast-pass/config";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";

interface MatchResult {
  sourceHeader: MappingResult["sourceHeader"];
  matchedMetric: MappingResult["matchedMetric"];
  matchedSlug: MappingResult["matchedSlug"];
  confidence: MappingResult["confidence"];
  alternatives: MappingResult["alternatives"];
  matchSource?: MappingResult["matchSource"];
  rationale?: MappingResult["rationale"];
  policyDecision?: MappingResult["policyDecision"];
}

function asCleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

export async function POST(req: NextRequest) {
  try {
    const { headers, memoryEnabledOverride } = (await req.json()) as {
      headers: unknown[];
      memoryEnabledOverride?: boolean;
    };

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return apiError("headers array is required", 400);
    }
    const normalizedHeaders = headers
      .map((header, index) => {
        const label = asCleanLabel(header);
        return label ?? `Column ${index + 1}`;
      })
      .filter((header) => header.length > 0);

    if (normalizedHeaders.length === 0) {
      return apiError("No usable headers were provided", 400);
    }

    const cookieStore = await cookies();
    const semanticTenantId = cookieStore.get("activeCustomerId")?.value ?? null;
    const { mergedMetrics, templateHeaders } = await buildMappingCatalog(
      semanticTenantId,
    );

    const memoryEnabled =
      typeof memoryEnabledOverride === "boolean"
        ? memoryEnabledOverride
        : FAST_PASS_CONFIG.mapping.memoryEnabled;
    const memoryPriorityBoost = FAST_PASS_CONFIG.mapping.memoryPriorityBoost;
    const memoryHintsRaw = memoryEnabled
      ? await getMemoryHintsForHeaders(normalizedHeaders, semanticTenantId)
      : [];
    const topMemoryCandidates = memoryEnabled
      ? await getTopMemoryCandidatesForHeaders(normalizedHeaders, semanticTenantId, 5)
      : {};
    const memoryHints = memoryHintsRaw.map((hint) => ({
      ...hint,
      confidenceScore: hint.confidenceScore + memoryPriorityBoost,
    }));
    const memoryByHeader = new Map<string, typeof memoryHints>();
    for (const header of normalizedHeaders) {
      memoryByHeader.set(
        header,
        memoryHints.filter((hint) => hint.sourceHeader === header),
      );
    }

    const mapAgentEnabled = FAST_PASS_CONFIG.mapping.mapAgentEnabled;
    const shadowMode = FAST_PASS_CONFIG.mapping.shadowMode;
    const llmRerankEnabled = FAST_PASS_CONFIG.mapping.llmRerankEnabled;
    const policy = {
      lowConfidenceThreshold: FAST_PASS_CONFIG.mapping.lowConfidenceThreshold,
      ambiguityGapThreshold: FAST_PASS_CONFIG.mapping.ambiguityGapThreshold,
      rerankOnlyLowConfidence: FAST_PASS_CONFIG.mapping.rerankOnlyLowConfidence,
      autoLearnEnabled: FAST_PASS_CONFIG.mapping.autoLearnEnabled,
      autoLearnMinConfidence: FAST_PASS_CONFIG.mapping.autoLearnMinConfidence,
      memoryOverrideThreshold: FAST_PASS_CONFIG.mapping.memoryOverrideThreshold,
    };

    const bundleHintCount = memoryHints.filter(
      (h) => h.cursorPriority === "core" || h.cursorPriority === "secondary",
    ).length;

    if (!mapAgentEnabled) {
      const deterministic = buildDeterministicMappings({
        headers: normalizedHeaders,
        metrics: mergedMetrics,
        templateHeaders,
        memoryHints,
      });
      return apiSuccess({
        mappings: deterministic as MatchResult[],
        telemetry: {
          engine: "deterministic",
          mapAgentEnabled,
          shadowMode,
          autoLearnEnabled: policy.autoLearnEnabled,
          memoryEnabled,
          memoryPriorityBoost,
          memoryHintCount: memoryHints.length,
          bundleHintCount,
          headersWithMemory: Object.keys(topMemoryCandidates).length,
        },
      });
    }

    const { mappings, autoLearnCandidates } = await runMappingGraph({
      headers: normalizedHeaders,
      metrics: mergedMetrics,
      templateHeaders,
      memoryHints,
      llmEnabled: llmRerankEnabled,
      shadowMode,
      policy,
    });

    const asyncRefinementEnabled = FAST_PASS_CONFIG.mapping.asyncRefinementEnabled;
    const lowConfidenceThreshold = FAST_PASS_CONFIG.mapping.asyncUnmatchedThreshold;
    const unmatchedForQueue = mappings.filter(
      (row) => !row.matchedSlug || row.confidence < lowConfidenceThreshold,
    );
    let queuedUnmatched = 0;
    if (asyncRefinementEnabled && unmatchedForQueue.length > 0) {
      const result = await enqueueUnmatchedColumns(
        unmatchedForQueue.map((row) => ({
          tenantId: semanticTenantId,
          sourceHeader: row.sourceHeader,
          context: {
            confidence: row.confidence,
            alternatives: row.alternatives.slice(0, 5),
            matchedSlug: row.matchedSlug,
          },
        })),
      );
      queuedUnmatched = result.queued;
      for (const row of mappings) {
        const isQueued = unmatchedForQueue.some(
          (candidate) => candidate.sourceHeader === row.sourceHeader,
        );
        if (isQueued && !row.rationale) {
          row.rationale = "Pending async unmatched refinement";
        }
      }
    }

    if (policy.autoLearnEnabled && autoLearnCandidates.length > 0) {
      await Promise.all(
        autoLearnCandidates.map((candidate) =>
          recordMappingSignal({
            tenantId: semanticTenantId,
            sourceHeader: candidate.sourceHeader,
            metricSlug: candidate.metricSlug,
            action: "auto_accept",
            source: "map-agent",
            context: {
              confidence: candidate.confidence,
              memoryHintCount:
                memoryByHeader.get(candidate.sourceHeader)?.length ?? 0,
              memoryTopCandidates:
                topMemoryCandidates[candidate.sourceHeader]
                  ?.slice(0, 3)
                  .map((item) => item.metricSlug) ?? [],
            },
          }),
        ),
      );
    }

    return apiSuccess({
      mappings: mappings as MatchResult[],
      telemetry: {
        engine: "langgraph_js",
        mapAgentEnabled,
        llmRerankEnabled,
        shadowMode,
        autoLearnEnabled: policy.autoLearnEnabled,
        autoLearnCandidates: autoLearnCandidates.length,
        memoryEnabled,
        memoryPriorityBoost,
        memoryHintCount: memoryHints.length,
        bundleHintCount,
        headersWithMemory: Object.keys(topMemoryCandidates).length,
        asyncRefinementEnabled,
        queuedUnmatched,
      },
    });
  } catch (error) {
    logger.error("fast-pass map route failed", {
      route: "/api/fast-pass/map",
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return apiError("Failed to map columns", 500);
  }
}
