import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

describe("Fast Pass API routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.MAP_AGENT_ENABLED;
  });

  it("maps headers via /api/fast-pass/map", async () => {
    vi.doMock("next/headers", () => ({
      cookies: async () => ({ get: () => ({ value: "tenant-1" }) }),
    }));
    vi.doMock("@/lib/fast-pass/services/mappingService", () => ({
      buildMappingCatalog: vi.fn().mockResolvedValue({
        mergedMetrics: [{ id: "1", name: "Market Rent", slug: "market_rent", format: "currency", category: "revenue" }],
        templateHeaders: [],
      }),
    }));
    vi.doMock("@/lib/fast-pass/repositories/learningRepository", () => ({
      getMemoryHintsForHeaders: vi.fn().mockResolvedValue([]),
      getTopMemoryCandidatesForHeaders: vi.fn().mockResolvedValue({}),
      enqueueUnmatchedColumns: vi.fn().mockResolvedValue({ queued: 0 }),
      recordMappingSignal: vi.fn().mockResolvedValue(undefined),
    }));
    vi.doMock("@/lib/fast-pass/agent/mappingGraph", () => ({
      runMappingGraph: vi.fn().mockResolvedValue({
        mappings: [
          {
            sourceHeader: "Market Rent",
            matchedMetric: "Market Rent",
            matchedSlug: "market_rent",
            confidence: 96,
            alternatives: [{ name: "Market Rent", slug: "market_rent", confidence: 96 }],
            matchSource: "deterministic",
            policyDecision: "deterministic_only",
          },
        ],
        autoLearnCandidates: [],
      }),
    }));
    vi.doMock("@/lib/fast-pass/agent/deterministicMatcher", () => ({
      buildDeterministicMappings: vi.fn().mockReturnValue([]),
    }));
    const { POST } = await import("@/app/api/fast-pass/map/route");
    const req = new NextRequest("http://localhost/api/fast-pass/map", {
      method: "POST",
      body: JSON.stringify({ headers: ["Market Rent"] }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const payload = await res.json();
    expect(res.status).toBe(200);
    expect(payload.mappings[0].matchedSlug).toBe("market_rent");
  });

  it("ingests rows via /api/fast-pass/memory/ingest (dry run)", async () => {
    vi.doMock("next/headers", () => ({
      cookies: async () => ({ get: () => ({ value: "tenant-1" }) }),
    }));
    vi.doMock("@/lib/db", () => ({
      prisma: {
        metricDefinition: {
          findMany: vi.fn().mockResolvedValue([{ slug: "market_rent", name: "Market Rent" }]),
        },
      },
    }));
    vi.doMock("@/lib/fast-pass/repositories/learningRepository", () => ({
      upsertSheetKnowledgeEntries: vi.fn().mockResolvedValue({ inserted: 1, updated: 0 }),
    }));
    const { POST } = await import("@/app/api/fast-pass/memory/ingest/route");
    const req = new NextRequest("http://localhost/api/fast-pass/memory/ingest", {
      method: "POST",
      body: JSON.stringify({
        dryRun: true,
        rows: [{ header: "Market Rent", metricSlug: "market_rent", description: "test" }],
      }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const payload = await res.json();
    expect(res.status).toBe(200);
    expect(payload.dryRun).toBe(true);
    expect(payload.ingestableRows).toBeGreaterThan(0);
  });

  it("resolves unmatched headers via bundle sync", async () => {
    vi.doMock("next/headers", () => ({
      cookies: async () => ({ get: () => ({ value: "tenant-1" }) }),
    }));
    vi.doMock("@/lib/db", () => ({
      prisma: {
        metricDefinition: { findMany: vi.fn().mockResolvedValue([]) },
      },
    }));
    vi.doMock("@/lib/fast-pass/repositories/learningRepository", () => ({
      getTopMemoryCandidatesForHeaders: vi.fn().mockResolvedValue({
        "Market Rent": [
          {
            metricSlug: "market_rent",
            confidenceScore: 10,
            reason: "pattern_match",
            evidenceCount: 200,
            cursorPriority: "core",
          },
        ],
      }),
      recordMappingSignal: vi.fn().mockResolvedValue(undefined),
      completeUnmatchedJob: vi.fn().mockResolvedValue(undefined),
    }));
    const { POST } = await import("@/app/api/fast-pass/unmatched/resolve/route");
    const req = new NextRequest("http://localhost/api/fast-pass/unmatched/resolve", {
      method: "POST",
      body: JSON.stringify({ headers: ["Market Rent"] }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const payload = await res.json();
    expect(res.status).toBe(200);
    expect(payload.telemetry.resolvedByBundle).toBe(1);
  });

  it("falls back heuristically in clarify chat when llm key is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.LITELLM_API_KEY;
    const { POST } = await import("@/app/api/fast-pass/clarify/chat/route");
    const req = new NextRequest("http://localhost/api/fast-pass/clarify/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "skip this",
        question: {
          id: "1",
          column: "Unknown Header",
          question: "Map this",
          suggestedAnswer: "Skip",
          type: "mapping",
        },
        mappings: [],
        allMetrics: [],
      }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const payload = await res.json();
    expect(res.status).toBe(200);
    expect(payload.action.type).toBe("skip");
  });
});
