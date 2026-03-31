import type { MappingResult } from "./types";

export interface MappingPolicyConfig {
  lowConfidenceThreshold: number;
  ambiguityGapThreshold: number;
  autoLearnEnabled: boolean;
  autoLearnMinConfidence: number;
  rerankOnlyLowConfidence: boolean;
  memoryOverrideThreshold: number;
}

export interface PolicyOutcome {
  needsLlm: boolean;
  reason: string;
}

export function shouldRerankWithLlm(
  row: MappingResult,
  config: MappingPolicyConfig,
): PolicyOutcome {
  const top = row.alternatives[0]?.confidence ?? row.confidence ?? 0;
  const memoryGuided = String(row.rationale || "")
    .toLowerCase()
    .includes("memory-guided");
  const second = row.alternatives[1]?.confidence ?? 0;
  const ambiguous = top - second <= config.ambiguityGapThreshold;
  const lowConfidence = top < config.lowConfidenceThreshold;
  if (memoryGuided && top >= config.lowConfidenceThreshold + config.memoryOverrideThreshold) {
    return { needsLlm: false, reason: "memory_guided_confident" };
  }
  if (!config.rerankOnlyLowConfidence) {
    return { needsLlm: true, reason: "policy_all_rows" };
  }
  if (lowConfidence) {
    return { needsLlm: true, reason: "low_confidence" };
  }
  if (ambiguous) {
    return { needsLlm: true, reason: "ambiguous_candidates" };
  }
  return { needsLlm: false, reason: "deterministic_confident" };
}

export function canAutoLearn(row: MappingResult, config: MappingPolicyConfig): boolean {
  if (!config.autoLearnEnabled) return false;
  if (!row.matchedSlug) return false;
  if (row.confidence < config.autoLearnMinConfidence) return false;
  return (
    row.matchSource === "hybrid_llm_confirmed" ||
    row.matchSource === "deterministic" ||
    row.matchSource === "memory_first"
  );
}
