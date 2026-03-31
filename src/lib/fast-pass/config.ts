function asNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value !== "false";
}

export const FAST_PASS_CONFIG = {
  mapping: {
    lowConfidenceThreshold: asNumber(process.env.MAP_LLM_LOW_CONFIDENCE_THRESHOLD, 85),
    ambiguityGapThreshold: asNumber(process.env.MAP_LLM_AMBIGUITY_GAP_THRESHOLD, 5),
    autoLearnMinConfidence: asNumber(process.env.MAP_AGENT_AUTO_LEARN_MIN_CONFIDENCE, 95),
    memoryOverrideThreshold: asNumber(process.env.MAP_MEMORY_OVERRIDE_THRESHOLD, 8),
    memoryPriorityBoost: asNumber(process.env.MAP_MEMORY_PRIORITY_BOOST, 3),
    asyncUnmatchedThreshold: asNumber(process.env.MAP_ASYNC_UNMATCHED_THRESHOLD, 70),
    memoryEnabled: asBoolean(process.env.MAP_MEMORY_ENABLED, true),
    mapAgentEnabled: asBoolean(process.env.MAP_AGENT_ENABLED, true),
    shadowMode: process.env.MAP_AGENT_SHADOW_MODE === "true",
    llmRerankEnabled: asBoolean(process.env.MAP_LLM_RERANK_ENABLED, true),
    rerankOnlyLowConfidence: asBoolean(process.env.MAP_LLM_ONLY_FOR_LOW_CONFIDENCE, true),
    autoLearnEnabled: asBoolean(process.env.MAP_AGENT_AUTO_LEARN_ENABLED, true),
    asyncRefinementEnabled: asBoolean(process.env.MAP_ASYNC_UNMATCHED_AGENT_ENABLED, true),
  },
  ingest: {
    minGuessScore: asNumber(process.env.MEMORY_MIN_GUESS_SCORE, 0.6),
    tokenMinLength: 4,
    descriptionMergeCap: 1000,
  },
  unmatched: {
    bundleSyncMinConfidence: 6,
    llmAcceptanceMinConfidence: 40,
    metricContextLimit: 200,
  },
  clarify: {
    metricContextLimit: 120,
    entityContextLimit: 40,
    measureContextLimit: 80,
  },
};
