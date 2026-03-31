import { describe, expect, it } from "vitest";
import { buildDeterministicMappings, fuzzyScore } from "@/lib/fast-pass/agent/deterministicMatcher";

describe("deterministicMatcher", () => {
  it("returns high score for exact header match", () => {
    expect(fuzzyScore("Market Rent", "Market Rent")).toBe(100);
  });

  it("maps headers to best metric deterministically", () => {
    const results = buildDeterministicMappings({
      headers: ["Market Rent"],
      metrics: [
        { id: "1", name: "Market Rent", slug: "market_rent" },
        { id: "2", name: "Deposit Held", slug: "deposit_held" },
      ],
      templateHeaders: [],
    });
    expect(results[0].matchedSlug).toBe("market_rent");
    expect(results[0].matchSource).toBe("deterministic");
  });

  it("promotes memory-first match when memory hint exists", () => {
    const results = buildDeterministicMappings({
      headers: ["Lease Approved"],
      metrics: [
        { id: "1", name: "Lease Approved", slug: "lease_approved" },
        { id: "2", name: "Lease Completed", slug: "lease_completed" },
      ],
      templateHeaders: [],
      memoryHints: [
        {
          sourceHeader: "Lease Approved",
          normalizedHeader: "lease_approved",
          metricSlug: "lease_approved",
          confidenceScore: 10,
          reason: "pattern_match",
        },
      ],
    });
    expect(results[0].matchedSlug).toBe("lease_approved");
    expect(results[0].matchSource).toBe("memory_first");
    expect(results[0].policyDecision).toBe("memory_locked");
  });
});
