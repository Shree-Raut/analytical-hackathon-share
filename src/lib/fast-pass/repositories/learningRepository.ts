import { prisma } from "@/lib/db";

export type MappingSignalAction =
  | "confirm"
  | "change"
  | "skip"
  | "auto_accept"
  | "auto_reject";

export interface MappingSignalInput {
  tenantId?: string | null;
  sourceHeader: string;
  metricSlug?: string | null;
  action: MappingSignalAction;
  source?: string;
  context?: Record<string, unknown>;
}

export interface UnmatchedQueueInput {
  tenantId?: string | null;
  sourceHeader: string;
  context?: Record<string, unknown>;
}

export interface SheetKnowledgeEntryInput {
  tenantId?: string | null;
  header: string;
  metricSlug: string;
  aliases?: string[];
  description?: string | null;
  definitionVariants?: string[];
  evidenceCount?: number;
  sourcePath?: string | null;
  sourceKind?: string;
  source?: string;
  fieldKind?: string;
  dataType?: string | null;
  cursorPriority?: string;
  bundleAmbiguity?: string | null;
  primaryTopic?: string | null;
}

export interface MappingMemoryHint {
  sourceHeader: string;
  normalizedHeader: string;
  metricSlug: string;
  confidenceScore: number;
  reason: "pattern_match" | "alias_match" | "fuzzy_alias_match";
  fieldKind?: string;
  cursorPriority?: string;
  bundleAmbiguity?: string | null;
  evidenceCount?: number;
}

export interface MemoryCandidate {
  metricSlug: string;
  confidenceScore: number;
  reason: MappingMemoryHint["reason"];
  sourceDescription?: string | null;
  evidenceCount: number;
  fieldKind?: string;
  dataType?: string | null;
  cursorPriority?: string;
  bundleAmbiguity?: string | null;
  primaryTopic?: string | null;
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/\*/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseAliases(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === "string" ? normalizeHeader(item) : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseJsonList(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function uniqueNormalizedAliases(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => normalizeHeader(value)).filter(Boolean)),
  );
}

function uniqueStringList(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const aTokens = new Set(a.split("_").filter(Boolean));
  const bTokens = new Set(b.split("_").filter(Boolean));
  const overlap = Array.from(aTokens).filter((token) => bTokens.has(token)).length;
  const denom = Math.max(aTokens.size, bTokens.size, 1);
  return overlap / denom;
}

export async function upsertSheetKnowledgeEntries(
  entries: SheetKnowledgeEntryInput[],
) {
  let inserted = 0;
  let updated = 0;

  for (const entry of entries) {
    const normalizedHeader = normalizeHeader(entry.header);
    const tenantId = entry.tenantId ?? null;
    if (!normalizedHeader || !entry.metricSlug) continue;
    const aliases = uniqueNormalizedAliases([
      normalizedHeader,
      ...(entry.aliases || []),
    ]);
    const sourcePath = entry.sourcePath || null;
    const sourceKind = entry.sourceKind || "sheet_seed";
    const source = entry.source || "sheet-ingest";
    const definitionVariants = uniqueStringList([
      ...(entry.description ? [entry.description] : []),
      ...(entry.definitionVariants || []),
    ]);
    const effectiveEvidenceCount = Math.max(1, entry.evidenceCount ?? 1);

    const existing = await prisma.fastPassMappingMemory.findFirst({
      where: {
        tenantId,
        headerPattern: normalizedHeader,
        metricSlug: entry.metricSlug,
      },
      select: { id: true, aliasesJson: true, definitionVariantsJson: true },
    });

    const bundleMeta = {
      fieldKind: entry.fieldKind || "metric",
      dataType: entry.dataType || null,
      cursorPriority: entry.cursorPriority || "core",
      bundleAmbiguity: entry.bundleAmbiguity || null,
      primaryTopic: entry.primaryTopic || null,
    };

    if (existing) {
      const existingAliases = parseAliases(existing.aliasesJson);
      const existingDefinitions = parseJsonList(existing.definitionVariantsJson);
      const mergedAliases = uniqueNormalizedAliases([...existingAliases, ...aliases]);
      const mergedDefinitions = uniqueStringList([
        ...existingDefinitions,
        ...definitionVariants,
      ]);
      await prisma.fastPassMappingMemory.update({
        where: { id: existing.id },
        data: {
          aliasesJson: JSON.stringify(mergedAliases),
          definitionVariantsJson: JSON.stringify(mergedDefinitions),
          evidenceCount: { increment: effectiveEvidenceCount },
          sourcePath,
          sourceKind,
          sourceDescription: entry.description || undefined,
          source,
          confidenceScore: { increment: 1 },
          lastMatchedAt: new Date(),
          lastSignalAt: new Date(),
          ...bundleMeta,
        },
      });
      updated += 1;
    } else {
      await prisma.fastPassMappingMemory.create({
        data: {
          tenantId,
          headerPattern: normalizedHeader,
          metricSlug: entry.metricSlug,
          aliasesJson: JSON.stringify(aliases),
          definitionVariantsJson: JSON.stringify(definitionVariants),
          evidenceCount: effectiveEvidenceCount,
          sourcePath,
          sourceKind,
          sourceDescription: entry.description || undefined,
          source,
          confidenceScore: 3,
          explicitWins: 1,
          lastMatchedAt: new Date(),
          lastConfirmedAt: new Date(),
          lastSignalAt: new Date(),
          ...bundleMeta,
        },
      });
      inserted += 1;
    }
  }

  return { inserted, updated };
}

export async function getMemoryForHeaders(
  headers: string[],
  tenantId?: string | null,
) {
  const normalized = Array.from(
    new Set(headers.map((header) => normalizeHeader(header)).filter(Boolean)),
  );
  if (normalized.length === 0) return [];

  return prisma.fastPassMappingMemory.findMany({
    where: {
      tenantId: tenantId ?? null,
      headerPattern: { in: normalized },
    },
    orderBy: [{ confidenceScore: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getMemoryHintsForHeaders(
  headers: string[],
  tenantId?: string | null,
): Promise<MappingMemoryHint[]> {
  const normalizedHeaders = headers.map((header) => ({
    sourceHeader: header,
    normalizedHeader: normalizeHeader(header),
  }));
  if (normalizedHeaders.length === 0) return [];

  const memoryRows = await prisma.fastPassMappingMemory.findMany({
    where: { tenantId: tenantId ?? null },
    select: {
      headerPattern: true,
      metricSlug: true,
      confidenceScore: true,
      aliasesJson: true,
      fieldKind: true,
      cursorPriority: true,
      bundleAmbiguity: true,
      evidenceCount: true,
    },
  });

  const hints: MappingMemoryHint[] = [];
  for (const row of memoryRows) {
    const aliases = parseAliases(row.aliasesJson);
    const priorityBonus = row.cursorPriority === "core" ? 2 : row.cursorPriority === "secondary" ? 0 : -3;
    const ambiguityPenalty = row.bundleAmbiguity === "high" ? -1 : 0;
    const usageBonus = row.evidenceCount >= 100 ? 2 : row.evidenceCount >= 50 ? 1 : 0;
    const metaBoost = priorityBonus + ambiguityPenalty + usageBonus;

    for (const header of normalizedHeaders) {
      if (!header.normalizedHeader) continue;
      const sharedMeta = {
        fieldKind: row.fieldKind,
        cursorPriority: row.cursorPriority,
        bundleAmbiguity: row.bundleAmbiguity,
        evidenceCount: row.evidenceCount,
      };
      if (row.headerPattern === header.normalizedHeader) {
        hints.push({
          sourceHeader: header.sourceHeader,
          normalizedHeader: header.normalizedHeader,
          metricSlug: row.metricSlug,
          confidenceScore: row.confidenceScore + 5 + metaBoost,
          reason: "pattern_match",
          ...sharedMeta,
        });
        continue;
      }
      if (aliases.includes(header.normalizedHeader)) {
        hints.push({
          sourceHeader: header.sourceHeader,
          normalizedHeader: header.normalizedHeader,
          metricSlug: row.metricSlug,
          confidenceScore: row.confidenceScore + 3 + metaBoost,
          reason: "alias_match",
          ...sharedMeta,
        });
        continue;
      }
      const bestAliasSimilarity = aliases.reduce(
        (best, alias) => Math.max(best, similarity(alias, header.normalizedHeader)),
        0,
      );
      if (bestAliasSimilarity >= 0.75) {
        hints.push({
          sourceHeader: header.sourceHeader,
          normalizedHeader: header.normalizedHeader,
          metricSlug: row.metricSlug,
          confidenceScore: row.confidenceScore + Math.round(bestAliasSimilarity * 2) + metaBoost,
          reason: "fuzzy_alias_match",
          ...sharedMeta,
        });
      }
    }
  }

  return hints;
}

export async function getTopMemoryCandidatesForHeaders(
  headers: string[],
  tenantId?: string | null,
  perHeaderLimit = 5,
): Promise<Record<string, MemoryCandidate[]>> {
  const hints = await getMemoryHintsForHeaders(headers, tenantId);
  const grouped: Record<string, MemoryCandidate[]> = {};
  if (hints.length === 0) return grouped;

  const uniqueSlugs = Array.from(new Set(hints.map((hint) => hint.metricSlug)));
  const memoryRows = await prisma.fastPassMappingMemory.findMany({
    where: {
      tenantId: tenantId ?? null,
      metricSlug: { in: uniqueSlugs },
    },
    select: {
      metricSlug: true,
      sourceDescription: true,
      evidenceCount: true,
      fieldKind: true,
      dataType: true,
      cursorPriority: true,
      bundleAmbiguity: true,
      primaryTopic: true,
    },
  });
  const rowBySlug = new Map(memoryRows.map((row) => [row.metricSlug, row]));

  for (const hint of hints) {
    if (!grouped[hint.sourceHeader]) grouped[hint.sourceHeader] = [];
    const rowMeta = rowBySlug.get(hint.metricSlug);
    grouped[hint.sourceHeader].push({
      metricSlug: hint.metricSlug,
      confidenceScore: hint.confidenceScore,
      reason: hint.reason,
      sourceDescription: rowMeta?.sourceDescription ?? null,
      evidenceCount: rowMeta?.evidenceCount ?? 0,
      fieldKind: rowMeta?.fieldKind ?? undefined,
      dataType: rowMeta?.dataType ?? null,
      cursorPriority: rowMeta?.cursorPriority ?? undefined,
      bundleAmbiguity: rowMeta?.bundleAmbiguity ?? null,
      primaryTopic: rowMeta?.primaryTopic ?? null,
    });
  }

  for (const key of Object.keys(grouped)) {
    grouped[key] = grouped[key]
      .sort((a, b) => b.confidenceScore - a.confidenceScore || b.evidenceCount - a.evidenceCount)
      .slice(0, perHeaderLimit);
  }
  return grouped;
}

export async function recordMappingSignal(input: MappingSignalInput) {
  const normalizedHeader = normalizeHeader(input.sourceHeader);
  const tenantId = input.tenantId ?? null;
  const source = input.source || "fast-pass";
  const metricSlug = input.metricSlug ?? null;

  let memoryId: string | null = null;
  if (metricSlug) {
    const existing = await prisma.fastPassMappingMemory.findFirst({
      where: {
        tenantId,
        headerPattern: normalizedHeader,
        metricSlug,
      },
      select: { id: true },
    });

    if (existing) {
      memoryId = existing.id;
      const updates: Record<string, unknown> = {
        lastMatchedAt: new Date(),
        lastSignalAt: new Date(),
      };
      if (input.action === "confirm" || input.action === "change") {
        updates.explicitWins = { increment: 1 };
        updates.lastConfirmedAt = new Date();
        updates.confidenceScore = { increment: 2 };
      } else if (input.action === "auto_accept") {
        updates.autoLearnWins = { increment: 1 };
        updates.confidenceScore = { increment: 1 };
      } else if (input.action === "auto_reject") {
        updates.explicitLosses = { increment: 1 };
        updates.confidenceScore = { decrement: 1 };
      }
      await prisma.fastPassMappingMemory.update({
        where: { id: existing.id },
        data: updates,
      });
      if (input.action === "confirm" || input.action === "change") {
        // Conflict-aware handling: slightly penalize alternative slugs for same header.
        await prisma.fastPassMappingMemory.updateMany({
          where: {
            tenantId,
            headerPattern: normalizedHeader,
            metricSlug: { not: metricSlug },
          },
          data: {
            explicitLosses: { increment: 1 },
            confidenceScore: { decrement: 1 },
          },
        });
      }
    } else if (
      input.action === "confirm" ||
      input.action === "change" ||
      input.action === "auto_accept"
    ) {
      const created = await prisma.fastPassMappingMemory.create({
        data: {
          tenantId,
          headerPattern: normalizedHeader,
          metricSlug,
          source,
          explicitWins: input.action === "confirm" || input.action === "change" ? 1 : 0,
          autoLearnWins: input.action === "auto_accept" ? 1 : 0,
          confidenceScore:
            input.action === "auto_accept" ? 1 : 2,
          evidenceCount: 1,
          lastMatchedAt: new Date(),
          lastConfirmedAt:
            input.action === "confirm" || input.action === "change"
              ? new Date()
              : null,
          lastSignalAt: new Date(),
        },
        select: { id: true },
      });
      memoryId = created.id;
      if (input.action === "confirm" || input.action === "change") {
        await prisma.fastPassMappingMemory.updateMany({
          where: {
            tenantId,
            headerPattern: normalizedHeader,
            metricSlug: { not: metricSlug },
          },
          data: {
            explicitLosses: { increment: 1 },
            confidenceScore: { decrement: 1 },
          },
        });
      }
    }
  }

  await prisma.fastPassMappingSignal.create({
    data: {
      tenantId,
      sourceHeader: input.sourceHeader,
      normalizedHeader,
      metricSlug,
      action: input.action,
      source,
      contextJson: JSON.stringify(input.context || {}),
      memoryId,
    },
  });
}

export function normalizeMappingHeader(header: string): string {
  return normalizeHeader(header);
}

export async function enqueueUnmatchedColumns(inputs: UnmatchedQueueInput[]) {
  let queued = 0;
  for (const input of inputs) {
    const sourceHeader = String(input.sourceHeader || "").trim();
    if (!sourceHeader) continue;
    const tenantId = input.tenantId ?? null;
    const normalizedHeader = normalizeHeader(sourceHeader);
    if (!normalizedHeader) continue;

    const existingPending = await prisma.fastPassUnmatchedQueue.findFirst({
      where: {
        tenantId,
        normalizedHeader,
        status: { in: ["pending", "processing"] },
      },
      select: { id: true },
    });
    if (existingPending) continue;

    await prisma.fastPassUnmatchedQueue.create({
      data: {
        tenantId,
        sourceHeader,
        normalizedHeader,
        contextJson: JSON.stringify(input.context || {}),
      },
    });
    queued += 1;
  }
  return { queued };
}

export async function claimPendingUnmatched(limit = 20) {
  const pending = await prisma.fastPassUnmatchedQueue.findMany({
    where: { status: "pending" },
    orderBy: [{ createdAt: "asc" }],
    take: limit,
  });
  if (pending.length === 0) return [];

  const claimed: typeof pending = [];
  for (const row of pending) {
    const updated = await prisma.fastPassUnmatchedQueue.updateMany({
      where: { id: row.id, status: "pending" },
      data: { status: "processing", attempts: { increment: 1 } },
    });
    if (updated.count > 0) claimed.push(row);
  }
  return claimed;
}

export async function completeUnmatchedJob(params: {
  id: string;
  recommendationSlug?: string | null;
  recommendationConfidence?: number | null;
  error?: string | null;
}) {
  await prisma.fastPassUnmatchedQueue.update({
    where: { id: params.id },
    data: {
      status: params.error ? "failed" : "resolved",
      lastError: params.error || null,
      recommendationSlug: params.recommendationSlug || null,
      recommendationConfidence: params.recommendationConfidence || null,
    },
  });
}
