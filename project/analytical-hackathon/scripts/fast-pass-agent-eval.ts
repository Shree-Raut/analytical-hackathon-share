const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const memoryFilePath = process.env.MEMORY_FILE_PATH || "";
const bundleDataset = process.env.BUNDLE_DATASET || "core-metrics";
const bundleIngestion = process.env.BUNDLE_INGEST !== "false";

const BUNDLE_TEST_HEADERS = [
  "Market Rent",
  "Deposit Held",
  "Lease Term",
  "Budgeted Rent",
  "Scheduled Charges",
  "Property",
  "Property Look-up Code",
  "Bldg-Unit",
  "Unit Type",
  "Resident",
  "Floor Plan",
  "New Leads",
  "Application Completed",
  "Lease Approved",
  "Prior Lease Rent",
  "Days Vacant",
  "Avg. Market Rent",
  "Unknown Column XYZ",
  "Gobbledygook 999",
];

const EXPECTED_MATCHES: Record<string, string> = {
  "Market Rent": "market_rent",
  "Deposit Held": "deposit_held",
  "Lease Term": "lease_term",
  "Budgeted Rent": "budgeted_rent",
  "Scheduled Charges": "scheduled_charges",
  "Property": "property",
  "Property Look-up Code": "property_look_up_code",
  "Bldg-Unit": "bldg_unit",
  "Unit Type": "unit_type",
  "Resident": "resident",
  "Floor Plan": "floor_plan",
  "New Leads": "new_leads",
  "Application Completed": "application_completed",
  "Lease Approved": "lease_approved",
  "Prior Lease Rent": "prior_lease_rent",
  "Days Vacant": "days_vacant",
  "Avg. Market Rent": "avg_market_rent",
};

async function loadRowsFromFile(filePath: string): Promise<Record<string, unknown>[]> {
  const { readFileSync } = await import("fs");
  const { extname } = await import("path");
  const xlsxModule = await import("xlsx");
  const maybeDefault = (xlsxModule as { default?: unknown }).default;
  const xlsx = (maybeDefault || xlsxModule) as typeof import("xlsx");
  const ext = extname(filePath).toLowerCase();
  if (ext === ".json") {
    const raw = JSON.parse(readFileSync(filePath, "utf8"));
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown[] }).rows)) {
      return (raw as { rows: Record<string, unknown>[] }).rows;
    }
    return [];
  }
  const workbook = xlsx.readFile(filePath);
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  return xlsx.utils.sheet_to_json(worksheet, { defval: "" }) as Record<string, unknown>[];
}

async function ingestMemoryIfProvided(): Promise<Record<string, unknown> | null> {
  if (!memoryFilePath) return null;
  const rows = await loadRowsFromFile(memoryFilePath);
  const ingestRes = await fetch(`${baseUrl}/api/fast-pass/memory/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filePath: memoryFilePath, rows, bundleDataset }),
  });
  const ingestPayload = await ingestRes.json();
  if (!ingestRes.ok) {
    throw new Error(ingestPayload.error || "memory ingest failed during eval");
  }
  return ingestPayload as Record<string, unknown>;
}

async function ingestBundleDatasets(): Promise<Record<string, unknown> | null> {
  if (!bundleIngestion) return null;
  const datasets = ["core-metrics", "core-dimensions"];
  const results: Record<string, unknown> = {};
  for (const ds of datasets) {
    const res = await fetch(`${baseUrl}/api/fast-pass/memory/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bundleDataset: ds }),
    });
    const payload = await res.json();
    if (!res.ok) {
      console.error(`Bundle ingest [${ds}] failed: ${payload.error}`);
      continue;
    }
    results[ds] = payload;
  }
  return results;
}

async function run(): Promise<void> {
  const memoryIngestPayload = await ingestMemoryIfProvided();
  const bundleIngestPayload = await ingestBundleDatasets();

  const baselineResponse = await fetch(`${baseUrl}/api/fast-pass/map`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headers: BUNDLE_TEST_HEADERS, memoryEnabledOverride: false }),
  });
  const baselinePayload = (await baselineResponse.json()) as {
    mappings?: Array<{
      sourceHeader: string;
      matchedSlug: string | null;
      confidence: number;
      matchSource?: string;
      policyDecision?: string;
      rationale?: string;
    }>;
    telemetry?: Record<string, unknown>;
    error?: string;
  };
  if (!baselineResponse.ok) {
    throw new Error(baselinePayload.error || "baseline map returned non-200");
  }

  const response = await fetch(`${baseUrl}/api/fast-pass/map`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headers: BUNDLE_TEST_HEADERS }),
  });
  const payload = (await response.json()) as typeof baselinePayload;
  if (!response.ok) {
    throw new Error(payload.error || "map route returned non-200");
  }
  if (!payload.mappings || payload.mappings.length !== BUNDLE_TEST_HEADERS.length) {
    throw new Error("mapping result size mismatch");
  }

  const matchedCount = payload.mappings.filter((r) => !!r.matchedSlug).length;
  const baselineMatched = (baselinePayload.mappings || []).filter((r) => !!r.matchedSlug).length;

  let correctMatches = 0;
  let incorrectMatches = 0;
  const details: Array<{
    header: string;
    expected: string | null;
    got: string | null;
    confidence: number;
    source: string | undefined;
    correct: boolean;
  }> = [];

  for (const mapping of payload.mappings) {
    const expected = EXPECTED_MATCHES[mapping.sourceHeader] ?? null;
    const got = mapping.matchedSlug;
    const correct = expected === null ? true : got === expected;
    if (expected && correct) correctMatches++;
    if (expected && !correct) incorrectMatches++;
    details.push({
      header: mapping.sourceHeader,
      expected,
      got,
      confidence: mapping.confidence,
      source: mapping.matchSource,
      correct,
    });
  }

  const memoryGuidedCount = payload.mappings.filter((r) =>
    String(r.rationale || "").toLowerCase().includes("memory"),
  ).length;

  const policyBreakdown = payload.mappings.reduce(
    (acc, row) => {
      const key = row.policyDecision || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const unmatchedHeaders = payload.mappings
    .filter((r) => !r.matchedSlug || r.confidence < 50)
    .map((r) => r.sourceHeader);

  let unmatchedResolveResult: Record<string, unknown> | null = null;
  if (unmatchedHeaders.length > 0) {
    try {
      const resolveRes = await fetch(`${baseUrl}/api/fast-pass/unmatched/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers: unmatchedHeaders }),
      });
      unmatchedResolveResult = (await resolveRes.json()) as Record<string, unknown>;
    } catch {
      unmatchedResolveResult = { error: "resolve call failed" };
    }
  }

  const ambiguousRow = payload.mappings.find(
    (r) => (r.confidence || 0) < 85 && r.matchedSlug,
  );
  let clarifyCheck: { attempted: boolean; ok: boolean; status?: number; error?: string } = {
    attempted: false,
    ok: true,
  };
  if (ambiguousRow) {
    clarifyCheck.attempted = true;
    try {
      const clarifyRes = await fetch(`${baseUrl}/api/fast-pass/clarify/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "use the first matching metric",
          question: {
            id: "eval-clarify-1",
            column: ambiguousRow.sourceHeader,
            question: `Map ${ambiguousRow.sourceHeader}`,
            suggestedAnswer: ambiguousRow.matchedSlug,
            type: "mapping",
          },
          mappings: payload.mappings,
          allMetrics: [],
        }),
      });
      clarifyCheck.status = clarifyRes.status;
      if (!clarifyRes.ok) {
        clarifyCheck.ok = false;
        clarifyCheck.error = "clarify endpoint returned non-200";
      }
    } catch {
      clarifyCheck.ok = false;
      clarifyCheck.error = "clarify call failed";
    }
  }

  const totalExpected = Object.keys(EXPECTED_MATCHES).length;
  const accuracy = totalExpected > 0 ? Math.round((correctMatches / totalExpected) * 100) : 0;

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        accuracy: `${accuracy}%`,
        correctMatches,
        incorrectMatches,
        totalExpected,
        baselineMatched,
        mapped: matchedCount,
        mappedDelta: matchedCount - baselineMatched,
        memoryGuidedCount,
        avgConfidence:
          Math.round(
            (payload.mappings.reduce((s, r) => s + r.confidence, 0) /
              Math.max(1, payload.mappings.length)) *
              100,
          ) / 100,
        avgConfidenceDelta:
          Math.round(
            ((payload.mappings.reduce((s, r) => s + r.confidence, 0) -
              (baselinePayload.mappings || []).reduce((s, r) => s + (r.confidence || 0), 0)) /
              Math.max(1, payload.mappings.length)) *
              100,
          ) / 100,
        policyBreakdown,
        telemetry: payload.telemetry || {},
        baselineTelemetry: baselinePayload.telemetry || {},
        memoryIngest: memoryIngestPayload,
        bundleIngest: bundleIngestPayload,
        unmatchedResolve: unmatchedResolveResult,
        clarifyCheck,
        details,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  const message =
    error instanceof Error ? error.message : "fast-pass-agent-eval failed";
  console.error(message);
  process.exit(1);
});

export {};
