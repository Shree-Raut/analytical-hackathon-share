const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const filePath = process.env.FILE_PATH || "";
const sheetName = process.env.SHEET_NAME || "";
const dryRun = process.env.DRY_RUN === "true";
const mode = process.env.MEMORY_INGEST_MODE || "rows";
const minGuessScore = Number(process.env.MEMORY_MIN_GUESS_SCORE || "0.6");
const bundleDataset = process.env.BUNDLE_DATASET || "";

async function readRowsFromFile(): Promise<Record<string, unknown>[]> {
  const { readFileSync } = await import("fs");
  const { extname } = await import("path");
  const xlsxModule = await import("xlsx");
  const XLSX = (xlsxModule as { default?: unknown } & Record<string, unknown>)
    .default as typeof import("xlsx") | undefined;
  const xlsx = XLSX || (xlsxModule as unknown as typeof import("xlsx"));
  const ext = extname(filePath).toLowerCase();
  if (ext === ".json") {
    const raw = JSON.parse(readFileSync(filePath, "utf8"));
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown[] }).rows)) {
      return (raw as { rows: Record<string, unknown>[] }).rows;
    }
    return [];
  }
  const wb = xlsx.readFile(filePath);
  const target =
    sheetName && wb.SheetNames.includes(sheetName) ? sheetName : wb.SheetNames[0];
  const ws = wb.Sheets[target];
  return xlsx.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[];
}

async function run() {
  if (!filePath) {
    throw new Error("FILE_PATH is required");
  }

  const rows = mode === "rows" ? await readRowsFromFile() : undefined;
  const response = await fetch(`${baseUrl}/api/fast-pass/memory/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filePath,
      bundleDataset: bundleDataset || undefined,
      sheetName: sheetName || undefined,
      rows,
      dryRun,
      minGuessScore,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      payload.details
        ? `${payload.error || "Ingest failed"}: ${payload.details}`
        : payload.error || "Ingest failed",
    );
  }

  console.log(JSON.stringify(payload, null, 2));
}

run().catch((error) => {
  const message =
    error instanceof Error ? error.message : "fast-pass-memory-ingest failed";
  console.error(message);
  process.exit(1);
});

export {};
