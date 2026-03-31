import { Annotation, START, StateGraph } from "@langchain/langgraph";
import type { MappingMemoryHint, MappingResult, MetricCandidate } from "./types";
import { buildDeterministicMappings } from "./deterministicMatcher";
import { canAutoLearn, shouldRerankWithLlm, type MappingPolicyConfig } from "./policy";
import { callLlm, getLlmConfig, parseJsonResponse } from "@/lib/llm-client";


const MappingGraphState = Annotation.Root({
  headers: Annotation<string[]>(),
  metrics: Annotation<MetricCandidate[]>(),
  templateHeaders: Annotation<string[]>(),
  memoryHints: Annotation<MappingMemoryHint[]>(),
  deterministic: Annotation<MappingResult[]>(),
  finalResults: Annotation<MappingResult[]>(),
  llmDecisions: Annotation<
    Record<string, { metricSlug: string; confidence: number; reason?: string }>
  >(),
  policy: Annotation<MappingPolicyConfig>(),
  llmEnabled: Annotation<boolean>(),
  shadowMode: Annotation<boolean>(),
  autoLearnCandidates: Annotation<
    Array<{ sourceHeader: string; metricSlug: string; confidence: number }>
  >(),
});

async function deterministicNode(state: typeof MappingGraphState.State) {
  const deterministic = buildDeterministicMappings({
    headers: state.headers,
    metrics: state.metrics,
    templateHeaders: state.templateHeaders,
    memoryHints: state.memoryHints,
  });
  return { deterministic, finalResults: deterministic };
}

async function llmRankNode(state: typeof MappingGraphState.State) {
  if (!state.llmEnabled) {
    return { llmDecisions: {} };
  }
  const rerankRows = state.deterministic.filter((row) =>
    shouldRerankWithLlm(row, state.policy).needsLlm,
  );
  if (rerankRows.length === 0) {
    return { llmDecisions: {} };
  }

  const llmConfig = getLlmConfig({
    modelEnvOrder: ["MESH_MODEL_ID", "LITELLM_MODEL", "OPENAI_MODEL"],
  });
  if (!llmConfig.apiKey) {
    return { llmDecisions: {} };
  }

  const memoryByHeader = new Map<string, MappingMemoryHint[]>();
  for (const hint of state.memoryHints) {
    const list = memoryByHeader.get(hint.sourceHeader) || [];
    list.push(hint);
    memoryByHeader.set(hint.sourceHeader, list);
  }

  const promptPayload = rerankRows.map((row) => {
    const hints = memoryByHeader.get(row.sourceHeader) || [];
    const bundleContext = hints.slice(0, 3).map((h) => ({
      slug: h.metricSlug,
      score: h.confidenceScore,
      reason: h.reason,
      fieldKind: h.fieldKind,
      priority: h.cursorPriority,
      usage: h.evidenceCount,
    }));
    return {
      sourceHeader: row.sourceHeader,
      deterministicTop: row.matchedSlug,
      deterministicConfidence: row.confidence,
      candidates: row.alternatives.slice(0, 5),
      bundleHints: bundleContext.length > 0 ? bundleContext : undefined,
    };
  });
  const prompt = `You are an AI mapping agent for report column headers.
Return STRICT JSON with this shape:
{
  "decisions": [
    {
      "sourceHeader": "string",
      "metricSlug": "string",
      "confidence": 0-100 number,
      "reason": "short reason"
    }
  ]
}
Rules:
- Choose metricSlug ONLY from candidates for that sourceHeader.
- Never invent metric slugs.
- If uncertain, choose deterministicTop.
- When bundleHints are present, strongly prefer candidates whose slug matches a bundle hint with priority "core" and high usage count.
- Penalize candidates with priority "review" — never auto-confirm those.

Rows:
${JSON.stringify(promptPayload)}
`;

  try {
    const llm = await callLlm(prompt, {
      config: llmConfig,
      temperature: 0.1,
    });
    if (!llm) return { llmDecisions: {} };
    const parsed = parseJsonResponse<{ decisions?: unknown[] }>(llm.text);
    if (!parsed || !Array.isArray(parsed.decisions)) {
      return { llmDecisions: {} };
    }

    const decisions: Record<
      string,
      { metricSlug: string; confidence: number; reason?: string }
    > = {};
    for (const raw of parsed.decisions as unknown[]) {
      if (!raw || typeof raw !== "object") continue;
      const row = raw as Record<string, unknown>;
      const sourceHeader =
        typeof row.sourceHeader === "string"
          ? row.sourceHeader.trim()
          : "";
      const metricSlug =
        typeof row.metricSlug === "string"
          ? row.metricSlug.trim()
          : "";
      if (!sourceHeader || !metricSlug) continue;
      const confidenceRaw = Number(row.confidence);
      const confidence = Number.isFinite(confidenceRaw)
        ? Math.max(0, Math.min(100, confidenceRaw))
        : 0;
      const reason =
        typeof row.reason === "string"
          ? row.reason
          : undefined;
      decisions[sourceHeader] = { metricSlug, confidence, reason };
    }
    return { llmDecisions: decisions };
  } catch {
    return { llmDecisions: {} };
  }
}

async function policyNode(state: typeof MappingGraphState.State) {
  const slugToMetric = new Map(state.metrics.map((metric) => [metric.slug, metric]));
  const finalResults = state.deterministic.map((row) => ({ ...row }));

  for (const row of finalResults) {
    const decision = state.llmDecisions[row.sourceHeader];
    if (!decision) continue;
    const candidateSlugs = new Set(row.alternatives.map((alt) => alt.slug));
    if (!candidateSlugs.has(decision.metricSlug)) continue;

    if (state.shadowMode) {
      row.rationale = "shadow_mode_no_override";
      row.policyDecision = "deterministic_only";
      continue;
    }

    const memoryProtected = row.rationale?.toLowerCase().includes("memory-guided");
    const confidenceDelta = decision.confidence - row.confidence;
    const shouldOverride =
      row.matchedSlug !== decision.metricSlug &&
      (row.confidence < state.policy.lowConfidenceThreshold ||
        (!memoryProtected && decision.confidence > row.confidence) ||
        (memoryProtected &&
          confidenceDelta >= state.policy.memoryOverrideThreshold));
    if (shouldOverride) {
      const metric = slugToMetric.get(decision.metricSlug);
      row.matchedSlug = decision.metricSlug;
      row.matchedMetric = metric?.name ?? row.matchedMetric;
      row.confidence = Math.max(
        row.confidence,
        Math.round(decision.confidence || row.confidence),
      );
      row.matchSource = "hybrid_llm_rerank";
      row.policyDecision = "llm_override";
      row.rationale = decision.reason;
    } else if (row.matchedSlug === decision.metricSlug) {
      row.matchSource = "hybrid_llm_confirmed";
      row.policyDecision = "llm_confirmed";
      row.rationale = decision.reason;
    }
  }

  const autoLearnCandidates = finalResults
    .filter((row) => canAutoLearn(row, state.policy) && row.matchedSlug)
    .map((row) => ({
      sourceHeader: row.sourceHeader,
      metricSlug: row.matchedSlug as string,
      confidence: row.confidence,
    }));

  return { finalResults, autoLearnCandidates };
}

const compiledGraph = new StateGraph(MappingGraphState)
  .addNode("deterministicStep", deterministicNode)
  .addNode("llmRankStep", llmRankNode)
  .addNode("policyStep", policyNode)
  .addEdge(START, "deterministicStep")
  .addEdge("deterministicStep", "llmRankStep")
  .addEdge("llmRankStep", "policyStep")
  .compile();

export interface RunMappingGraphInput {
  headers: string[];
  metrics: MetricCandidate[];
  templateHeaders: string[];
  memoryHints: MappingMemoryHint[];
  policy: MappingPolicyConfig;
  llmEnabled: boolean;
  shadowMode: boolean;
}

export async function runMappingGraph(input: RunMappingGraphInput) {
  const output = await compiledGraph.invoke({
    headers: input.headers,
    metrics: input.metrics,
    templateHeaders: input.templateHeaders,
    memoryHints: input.memoryHints,
    deterministic: [],
    finalResults: [],
    llmDecisions: {},
    policy: input.policy,
    llmEnabled: input.llmEnabled,
    shadowMode: input.shadowMode,
    autoLearnCandidates: [],
  });
  return {
    mappings: output.finalResults,
    autoLearnCandidates: output.autoLearnCandidates,
  };
}
