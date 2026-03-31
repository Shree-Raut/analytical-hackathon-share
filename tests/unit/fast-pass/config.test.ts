import { describe, expect, it, vi } from "vitest";

describe("FAST_PASS_CONFIG", () => {
  it("loads defaults when env vars are absent", async () => {
    vi.resetModules();
    delete process.env.MAP_MEMORY_PRIORITY_BOOST;
    delete process.env.MAP_LLM_LOW_CONFIDENCE_THRESHOLD;
    const { FAST_PASS_CONFIG } = await import("@/lib/fast-pass/config");
    expect(FAST_PASS_CONFIG.mapping.memoryPriorityBoost).toBe(3);
    expect(FAST_PASS_CONFIG.mapping.lowConfidenceThreshold).toBe(85);
  });

  it("parses numeric env vars", async () => {
    vi.resetModules();
    process.env.MAP_MEMORY_PRIORITY_BOOST = "6";
    process.env.MAP_LLM_LOW_CONFIDENCE_THRESHOLD = "77";
    const { FAST_PASS_CONFIG } = await import("@/lib/fast-pass/config");
    expect(FAST_PASS_CONFIG.mapping.memoryPriorityBoost).toBe(6);
    expect(FAST_PASS_CONFIG.mapping.lowConfidenceThreshold).toBe(77);
  });
});
