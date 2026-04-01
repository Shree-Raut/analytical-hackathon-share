const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const dryRun = process.env.DRY_RUN === "true";
const datasets = (process.env.BUNDLE_DATASETS || "core-metrics,core-dimensions,review-top800").split(",").map(s => s.trim()).filter(Boolean);

async function ingestDataset(dataset: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${baseUrl}/api/fast-pass/memory/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bundleDataset: dataset, dryRun }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `[${dataset}] ${payload.details ? `${payload.error}: ${payload.details}` : payload.error || "ingest failed"}`,
    );
  }
  return payload as Record<string, unknown>;
}

async function run() {
  console.log(`Bundle ingest — datasets: ${datasets.join(", ")} | dryRun: ${dryRun}`);

  const results: Record<string, unknown> = {};
  for (const dataset of datasets) {
    console.log(`\nIngesting: ${dataset}...`);
    const result = await ingestDataset(dataset);
    results[dataset] = result;
    console.log(`  → ${result.ingestableRows ?? result.ingestableRows} entries ingested`);
    if (result.diagnostics) {
      console.log(`  → diagnostics: ${JSON.stringify(result.diagnostics)}`);
    }
  }

  console.log("\n=== Full Results ===");
  console.log(JSON.stringify(results, null, 2));
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : "bundle ingest failed";
  console.error(message);
  process.exit(1);
});

export {};
