import { describe, expect, it } from "vitest";
import { canAutoLearn, shouldRerankWithLlm } from "@/lib/fast-pass/agent/policy";
import type { MappingResult } from "@/lib/fast-pass/agent/types";

const basePolicy = {
  lowConfidenceThreshold: 85,
  ambiguityGapThreshold: 5,
  autoLearnEnabled: true,
  autoLearnMinConfidence: 95,
  rerankOnlyLowConfidence: true,
  memoryOverrideThreshold: 8,
};

function row(overrides?: Partial<MappingResult>): MappingResult {
  return {
    sourceHeader: "Market Rent",
    matchedMetric: "Market Rent",
    matchedSlug: "market_rent",
    confidence: 90,
    alternatives: [
      { name: "Market Rent", slug: "market_rent", confidence: 90 },
      { name: "Deposit Held", slug: "deposit_held", confidence: 70 },
    ],
    matchSource: "deterministic",
    policyDecision: "deterministic_only",
    ...overrides,
  };
}

describe("mapping policy", () => {
  it("reranks low-confidence rows", () => {
    const outcome = shouldRerankWithLlm(
      row({
        confidence: 60,
        alternatives: [
          { name: "Market Rent", slug: "market_rent", confidence: 60 },
          { name: "Deposit Held", slug: "deposit_held", confidence: 55 },
        ],
      }),
      basePolicy,
    );
    expect(outcome.needsLlm).toBe(true);
    expect(outcome.reason).toBe("low_confidence");
  });

  it("skips rerank for strong memory-guided rows", () => {
    const outcome = shouldRerankWithLlm(
      row({
        confidence: 95,
        alternatives: [
          { name: "Market Rent", slug: "market_rent", confidence: 95 },
          { name: "Deposit Held", slug: "deposit_held", confidence: 70 },
        ],
        rationale: "Memory-guided header match",
      }),
      basePolicy,
    );
    expect(outcome.needsLlm).toBe(false);
    expect(outcome.reason).toBe("memory_guided_confident");
  });

  it("enables auto-learn for memory_first high confidence", () => {
    const ok = canAutoLearn(
      row({ confidence: 98, matchSource: "memory_first" }),
      basePolicy,
    );
    expect(ok).toBe(true);
  });
});
