import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import AdmZip from "adm-zip";

export interface IngestRequestShape {
  filePath?: string;
  sheetName?: string;
  rows?: Record<string, unknown>[];
  bundleDataset?: "full" | "core" | "top800" | "core-metrics" | "core-dimensions";
  headerColumn?: string;
  metricSlugColumn?: string;
  aliasColumn?: string;
  descriptionColumn?: string;
  dryRun?: boolean;
  minGuessScore?: number;
}

interface BundleRow {
  key?: string;
  displayName?: string;
  aliases?: string[] | string;
  description?: string;
  usageCount?: number;
  distinctDescriptions?: number;
  fieldKind?: string;
  dataType?: string;
  primaryTopic?: string;
  cursorPriority?: string;
  ambiguity?: string;
}

export function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

export function keyify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\*/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function parseAliases(value: string): string[] {
  return value
    .split(/[|,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function mergeDescription(current: string | null, incoming: string | null): string | null {
  if (!incoming) return current;
  if (!current) return incoming;
  if (current.includes(incoming)) return current;
  if (incoming.includes(current)) return incoming;
  const combined = `${current} | ${incoming}`;
  return combined.length > 1000 ? combined.slice(0, 1000) : combined;
}

export function buildTokenSlugIndex(
  metrics: Array<{ slug: string; name: string }>,
): Map<string, string[]> {
  const tokenMap = new Map<string, string[]>();
  for (const metric of metrics) {
    const tokenSet = new Set(
      `${keyify(metric.name)}_${keyify(metric.slug)}`
        .split("_")
        .filter((token) => token.length >= 4),
    );
    for (const token of tokenSet) {
      const existing = tokenMap.get(token) || [];
      if (!existing.includes(metric.slug)) existing.push(metric.slug);
      tokenMap.set(token, existing);
    }
  }
  return tokenMap;
}

export function pickColumn(
  row: Record<string, unknown>,
  explicit: string | undefined,
  candidates: string[],
): string {
  if (explicit && normalize(row[explicit])) return normalize(row[explicit]);
  for (const candidate of candidates) {
    if (normalize(row[candidate])) return normalize(row[candidate]);
  }
  return "";
}

export function bundleEntryByDataset(dataset?: IngestRequestShape["bundleDataset"]): string {
  switch (dataset) {
    case "core":
      return "fast-pass-rdb-columns.core.json";
    case "top800":
      return "fast-pass-rdb-columns.review-top800.json";
    case "core-metrics":
      return "fast-pass-rdb-columns.core-metrics.json";
    case "core-dimensions":
      return "fast-pass-rdb-columns.core-dimensions.json";
    case "full":
    default:
      return "fast-pass-rdb-columns.full.json";
  }
}

export function bundleRowsToRecords(rows: BundleRow[]): Record<string, unknown>[] {
  return rows.map((row) => ({
    header: normalize(row.displayName || row.key || ""),
    metricSlug: normalize(row.key || ""),
    aliases: Array.isArray(row.aliases) ? row.aliases.join("|") : normalize(row.aliases || ""),
    description: normalize(row.description || ""),
    evidenceCount:
      typeof row.usageCount === "number"
        ? row.usageCount
        : typeof row.distinctDescriptions === "number"
          ? row.distinctDescriptions
          : 1,
    definitionVariants: normalize(row.description || ""),
    fieldKind: normalize(row.fieldKind || "metric"),
    dataType: normalize(row.dataType || ""),
    primaryTopic: normalize(row.primaryTopic || ""),
    cursorPriority: normalize(row.cursorPriority || "core"),
    bundleAmbiguity: normalize(row.ambiguity || ""),
  }));
}

export async function readRows(
  filePath: string,
  sheetName?: string,
  bundleDataset?: IngestRequestShape["bundleDataset"],
): Promise<Record<string, unknown>[]> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".zip") {
    const zip = new AdmZip(filePath);
    const entryName = bundleEntryByDataset(bundleDataset);
    const entry = zip.getEntry(entryName);
    if (!entry) return [];
    const payload = JSON.parse(zip.readAsText(entry));
    if (!Array.isArray(payload)) return [];
    return bundleRowsToRecords(payload as BundleRow[]);
  }
  if (ext === ".json") {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (Array.isArray(raw)) return raw as Record<string, unknown>[];
    if (raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown[] }).rows)) {
      return (raw as { rows: Record<string, unknown>[] }).rows;
    }
    return [];
  }
  const workbook = XLSX.readFile(filePath);
  const targetSheet =
    sheetName && workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0];
  const ws = workbook.Sheets[targetSheet];
  return XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[];
}

export function loadRowsFromKnowledge(bundleDataset: IngestRequestShape["bundleDataset"]) {
  const knowledgeDir = path.resolve(process.cwd(), "knowledge");
  const bundleFile = path.join(knowledgeDir, bundleEntryByDataset(bundleDataset));
  if (!fs.existsSync(bundleFile)) return [];
  const raw = JSON.parse(fs.readFileSync(bundleFile, "utf8"));
  if (!Array.isArray(raw)) return [];
  return bundleRowsToRecords(raw as BundleRow[]);
}
