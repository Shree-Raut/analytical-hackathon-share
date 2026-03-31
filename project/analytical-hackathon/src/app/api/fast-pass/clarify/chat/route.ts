import { NextRequest, NextResponse } from "next/server";
import { getSemanticSchemaSnapshot } from "@/lib/semantic-layer/adapter";
import { cookies } from "next/headers";
import {
  getTopMemoryCandidatesForHeaders,
  recordMappingSignal,
} from "@/lib/fast-pass/repositories/learningRepository";
import { callLlm, getLlmConfig, parseJsonResponse } from "@/lib/llm-client";
import { FAST_PASS_CONFIG } from "@/lib/fast-pass/config";
import { logger } from "@/lib/logger";

interface ClarificationQuestion {
  id: string;
  column: string;
  question: string;
  suggestedAnswer: string;
  type: "mapping" | "calculation";
  options?: string[];
}

interface MappingEntry {
  sourceHeader: string;
  matchedMetric: string | null;
  matchedSlug: string | null;
  confidence: number;
  excluded?: boolean;
  alternatives?: { name: string; slug: string; confidence: number }[];
}

interface MetricOption {
  id: string;
  name: string;
  slug: string;
  format: string;
  category: string;
  description?: string;
}

interface ChatRequest {
  message: string;
  question: ClarificationQuestion;
  conversationHistory?: { role: "agent" | "user"; text: string }[];
  mappings: MappingEntry[];
  allMetrics: MetricOption[];
}

type Action =
  | { type: "update_mapping"; sourceHeader: string; metricSlug: string; metricName: string }
  | { type: "skip"; sourceHeader: string };

function heuristicFallback(
  message: string,
  question: ClarificationQuestion,
  allMetrics: MetricOption[],
): { reply: string; action?: Action } {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return { reply: "Please provide a mapping choice or ask to skip this column." };
  }

  if (normalized.includes("skip") || normalized.includes("ignore") || normalized.includes("exclude")) {
    return {
      reply: `Got it. I will exclude "${question.column}" from this report.`,
      action: { type: "skip", sourceHeader: question.column },
    };
  }

  const exact = allMetrics.find(
    (metric) =>
      metric.name.toLowerCase() === normalized ||
      metric.slug.toLowerCase() === normalized,
  );
  if (exact) {
    return {
      reply: `Mapped "${question.column}" to "${exact.name}".`,
      action: {
        type: "update_mapping",
        sourceHeader: question.column,
        metricSlug: exact.slug,
        metricName: exact.name,
      },
    };
  }

  const contains = allMetrics.find(
    (metric) =>
      normalized.includes(metric.name.toLowerCase()) ||
      normalized.includes(metric.slug.toLowerCase()),
  );
  if (contains) {
    return {
      reply: `Mapped "${question.column}" to "${contains.name}".`,
      action: {
        type: "update_mapping",
        sourceHeader: question.column,
        metricSlug: contains.slug,
        metricName: contains.name,
      },
    };
  }

  if ((normalized === "yes" || normalized === "use this" || normalized === "looks good") && question.options?.[0]) {
    const first = allMetrics.find(
      (metric) =>
        metric.name.toLowerCase() === question.options?.[0].toLowerCase(),
    );
    if (first) {
      return {
        reply: `Confirmed "${question.column}" as "${first.name}".`,
        action: {
          type: "update_mapping",
          sourceHeader: question.column,
          metricSlug: first.slug,
          metricName: first.name,
        },
      };
    }
  }

  return {
    reply:
      "I could not map that answer to a known metric yet. Please choose an option chip, type an exact metric name, or say skip.",
  };
}

export async function POST(req: NextRequest) {
  let message = "";
  let question: ClarificationQuestion | null = null;
  let allMetrics: MetricOption[] = [];
  try {
    const body = (await req.json()) as ChatRequest;
    message = body.message;
    question = body.question;
    allMetrics = body.allMetrics;

    if (!message || !question || !allMetrics) {
      return NextResponse.json(
        { error: "message, question, and allMetrics are required" },
        { status: 400 },
      );
    }
    const activeQuestion = question;

    const llmConfig = getLlmConfig();

    if (!llmConfig.apiKey) {
      return NextResponse.json(heuristicFallback(message, activeQuestion, allMetrics));
    }

    const contextMetrics = allMetrics.slice(0, FAST_PASS_CONFIG.clarify.metricContextLimit).map((metric) => ({
      name: metric.name,
      slug: metric.slug,
      category: metric.category,
      format: metric.format,
      description: metric.description || "",
    }));
    const semanticSnapshot = await getSemanticSchemaSnapshot();
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("activeCustomerId")?.value ?? null;
    const memoryCandidates = await getTopMemoryCandidatesForHeaders(
      [activeQuestion.column],
      tenantId,
      5,
    );
    const memoryContext = (memoryCandidates[activeQuestion.column] || []).map(
      (candidate) => ({
        metricSlug: candidate.metricSlug,
        confidenceScore: candidate.confidenceScore,
        evidenceCount: candidate.evidenceCount,
        reason: candidate.reason,
        definition: candidate.sourceDescription || "",
        fieldKind: candidate.fieldKind || "metric",
        dataType: candidate.dataType || "",
        cursorPriority: candidate.cursorPriority || "core",
        primaryTopic: candidate.primaryTopic || "",
      }),
    );
    const memoryTelemetry = {
      memoryCandidateCount: memoryContext.length,
      memoryTopSlugs: memoryContext.slice(0, 3).map((item) => item.metricSlug),
    };
    const semanticSummary = {
      version: semanticSnapshot.version,
      entities: semanticSnapshot.entities
        .slice(0, FAST_PASS_CONFIG.clarify.entityContextLimit)
        .map((entity) => entity.name),
      measures: semanticSnapshot.measures
        .slice(0, FAST_PASS_CONFIG.clarify.measureContextLimit)
        .map((measure) => ({
        name: measure.name,
        displayName: measure.displayName,
      })),
    };

    const prompt = `You are assisting with report column mapping.
Return JSON only with this shape:
{
  "reply": "short natural-language response",
  "action": {
    "type": "update_mapping" | "skip" | "none",
    "sourceHeader": string,
    "metricSlug": string,
    "metricName": string
  }
}

Rules:
- Use action.type "update_mapping" only when you are confident about the metric.
- Use action.type "skip" when user clearly asks to skip/exclude.
- Use action.type "none" when unresolved.
- Never invent metric slugs; choose from the provided metric list.
- Prefer memory candidates when confidence and evidence are strong.
- When memory candidates have cursorPriority "core" and high evidenceCount, trust them more.
- Never auto-confirm candidates with cursorPriority "review" — ask the user to verify.
- Use fieldKind (metric vs dimension) and dataType to guide your reasoning about what the column represents.

Current question:
${JSON.stringify(activeQuestion)}

Available metrics (truncated):
${JSON.stringify(contextMetrics)}

Semantic layer summary (governed model context):
${JSON.stringify(semanticSummary)}

Memory candidates from learned sheet knowledge:
${JSON.stringify(memoryContext)}

User response:
${message}`;

    const llm = await callLlm(prompt, { config: llmConfig, temperature: 0.1 });
    if (!llm) {
      return NextResponse.json(heuristicFallback(message, activeQuestion, allMetrics));
    }
    const parsed = parseJsonResponse(llm.text);
    if (!parsed) {
      return NextResponse.json(heuristicFallback(message, activeQuestion, allMetrics));
    }

    const reply =
      typeof parsed.reply === "string"
        ? parsed.reply
        : "I reviewed your answer. Please confirm the metric choice.";
    const actionRaw =
      parsed.action && typeof parsed.action === "object"
        ? (parsed.action as Record<string, unknown>)
        : null;

    if (!actionRaw || actionRaw.type === "none") {
      return NextResponse.json({ reply, telemetry: memoryTelemetry });
    }

    if (actionRaw.type === "skip") {
      await recordMappingSignal({
        tenantId,
        sourceHeader: activeQuestion.column,
        metricSlug: null,
        action: "skip",
        source: "clarify-chat",
        context: { via: "llm_action" },
      });
      return NextResponse.json({
        reply,
        telemetry: memoryTelemetry,
        action: {
          type: "skip",
          sourceHeader:
            typeof actionRaw.sourceHeader === "string"
              ? actionRaw.sourceHeader
              : activeQuestion.column,
        },
      });
    }

    if (actionRaw.type === "update_mapping") {
      const metricSlug =
        typeof actionRaw.metricSlug === "string" ? actionRaw.metricSlug : "";
      const metric = allMetrics.find((m) => m.slug === metricSlug);
      if (!metric) {
        return NextResponse.json(heuristicFallback(message, activeQuestion, allMetrics));
      }
      const questionMapping = body.mappings.find(
        (mapping) => mapping.sourceHeader === activeQuestion.column,
      );
      const candidateSlugs = new Set(
        (questionMapping?.alternatives || []).map((candidate) => candidate.slug),
      );
      if (candidateSlugs.size > 0 && !candidateSlugs.has(metricSlug)) {
        return NextResponse.json(heuristicFallback(message, activeQuestion, allMetrics));
      }
      await recordMappingSignal({
        tenantId,
        sourceHeader: activeQuestion.column,
        metricSlug,
        action: "change",
        source: "clarify-chat",
        context: {
          via: "llm_action",
          confidence: questionMapping?.confidence ?? null,
        },
      });
      return NextResponse.json({
        reply,
        telemetry: memoryTelemetry,
        action: {
          type: "update_mapping",
          sourceHeader:
            typeof actionRaw.sourceHeader === "string"
              ? actionRaw.sourceHeader
              : activeQuestion.column,
          metricSlug: metric.slug,
          metricName: metric.name,
        },
      });
    }

    return NextResponse.json({ reply, telemetry: memoryTelemetry });
  } catch {
    logger.error("fast-pass clarify chat failed", {
      route: "/api/fast-pass/clarify/chat",
    });
    if (message && question && allMetrics.length > 0) {
      return NextResponse.json(heuristicFallback(message, question, allMetrics));
    }
    return NextResponse.json(
      { error: "Failed to process clarification response" },
      { status: 500 },
    );
  }
}
