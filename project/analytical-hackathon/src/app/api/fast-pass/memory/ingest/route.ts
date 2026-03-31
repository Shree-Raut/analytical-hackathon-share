import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { upsertSheetKnowledgeEntries } from "@/lib/fast-pass/repositories/learningRepository";
import {
  type IngestRequestShape as IngestRequest,
  buildTokenSlugIndex,
  bundleEntryByDataset,
  keyify,
  loadRowsFromKnowledge,
  mergeDescription,
  normalize,
  parseAliases,
  pickColumn,
  readRows,
} from "@/lib/fast-pass/services/ingestService";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IngestRequest;
    const filePath = normalize(body.filePath);
    if (filePath && !fs.existsSync(filePath)) {
      return apiError(`filePath not found: ${filePath}`, 400);
    }
    let rows: Record<string, unknown>[] = [];
    if (Array.isArray(body.rows) && body.rows.length > 0) {
      rows = body.rows;
    } else if (filePath) {
      rows = await readRows(filePath, body.sheetName, body.bundleDataset);
    } else if (body.bundleDataset) {
      rows = loadRowsFromKnowledge(body.bundleDataset);
    }
    if (!rows.length && !filePath && !body.bundleDataset) {
      return apiError("Provide filePath, rows payload, or bundleDataset", 400);
    }
    if (!rows.length) {
      return apiError("No rows found in source file", 400);
    }

    const metricDefs = await prisma.metricDefinition.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
    });
    const bySlug = new Set(metricDefs.map((m) => m.slug));
    const byName = new Map(metricDefs.map((m) => [keyify(m.name), m.slug]));
    const tokenSlugIndex = buildTokenSlugIndex(metricDefs);
    const minGuessScore = Number(body.minGuessScore ?? "0.6");
    const diagnostics = {
      missingHeader: 0,
      unresolvedMetric: 0,
      deduped: 0,
      accepted: 0,
      rejectedNoDescription: 0,
    };

    const preview: Array<{
      header: string;
      metricSlug: string;
      aliases: string[];
      description: string | null;
      evidenceCount?: number;
      definitionVariants?: string[];
      fieldKind?: string;
      dataType?: string;
      cursorPriority?: string;
      bundleAmbiguity?: string;
      primaryTopic?: string;
    }> = [];

    for (const row of rows) {
      const header = pickColumn(
        row,
        body.headerColumn,
        ["header", "sourceHeader", "field", "column", "columnHeader", "displayName", "name"],
      );
      if (!header) {
        diagnostics.missingHeader += 1;
        continue;
      }
      let metricSlug = pickColumn(
        row,
        body.metricSlugColumn,
        ["metricSlug", "targetMetricSlug", "mappedSlug", "metric", "slug"],
      );
      if (!metricSlug) {
        const guessed = byName.get(keyify(header));
        if (guessed) metricSlug = guessed;
      }
      const description = pickColumn(
        row,
        body.descriptionColumn,
        ["description", "definition", "notes", "helpText"],
      );
      if (!metricSlug && description) {
        const tokens = keyify(`${header} ${description}`)
          .split("_")
          .filter((token) => token.length >= 4);
        const scoreBySlug = new Map<string, number>();
        for (const token of tokens) {
          const slugs = tokenSlugIndex.get(token) || [];
          for (const slug of slugs) {
            scoreBySlug.set(slug, (scoreBySlug.get(slug) || 0) + 1);
          }
        }
        let best: { slug: string; score: number } | null = null;
        for (const [slug, score] of scoreBySlug.entries()) {
          const normalizedScore = score / Math.max(tokens.length, 1);
          if (!best || normalizedScore > best.score) {
            best = { slug, score: normalizedScore };
          }
        }
        if (best && best.score >= minGuessScore) {
          metricSlug = best.slug;
        }
      }
      if (!metricSlug || !bySlug.has(metricSlug)) {
        diagnostics.unresolvedMetric += 1;
        continue;
      }

      const aliasesRaw = pickColumn(
        row,
        body.aliasColumn,
        ["aliases", "alias", "synonyms", "alternateNames"],
      );
      if (!description) diagnostics.rejectedNoDescription += 1;
      const aliases = parseAliases(aliasesRaw);
      const evidenceRaw = Number(row.evidenceCount);
      const evidenceCount = Number.isFinite(evidenceRaw)
        ? Math.max(1, Math.round(evidenceRaw))
        : 1;
      const variantsRaw =
        typeof row.definitionVariants === "string"
          ? row.definitionVariants
          : description || "";
      const definitionVariants = parseAliases(variantsRaw).length
        ? parseAliases(variantsRaw)
        : description
          ? [description]
          : [];
      preview.push({
        header,
        metricSlug,
        aliases,
        description: description || null,
        evidenceCount,
        definitionVariants,
        fieldKind: normalize(row.fieldKind) || undefined,
        dataType: normalize(row.dataType) || undefined,
        cursorPriority: normalize(row.cursorPriority) || undefined,
        bundleAmbiguity: normalize(row.bundleAmbiguity) || undefined,
        primaryTopic: normalize(row.primaryTopic) || undefined,
      });
    }

    const deduped = new Map<string, (typeof preview)[number]>();
    for (const entry of preview) {
      const key = `${keyify(entry.header)}::${entry.metricSlug}`;
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, entry);
      } else {
        diagnostics.deduped += 1;
        existing.aliases = Array.from(new Set([...existing.aliases, ...entry.aliases]));
        existing.description = mergeDescription(existing.description, entry.description);
        existing.evidenceCount = (existing.evidenceCount || 1) + (entry.evidenceCount || 1);
        existing.definitionVariants = Array.from(
          new Set([...(existing.definitionVariants || []), ...(entry.definitionVariants || [])]),
        );
      }
    }
    const prepared = Array.from(deduped.values());
    diagnostics.accepted = prepared.length;
    const cookieStore = await cookies();
    const tenantId = cookieStore.get("activeCustomerId")?.value ?? null;

    if (body.dryRun) {
      return apiSuccess({
        dryRun: true,
        filePath,
        parsedRows: rows.length,
        candidateRows: preview.length,
        ingestableRows: prepared.length,
        diagnostics,
        sample: prepared.slice(0, 10),
        datasetSource:
          path.extname(filePath).toLowerCase() === ".zip"
            ? bundleEntryByDataset(body.bundleDataset)
            : null,
      });
    }

    const writeResult = await upsertSheetKnowledgeEntries(
      prepared.map((entry) => ({
        tenantId,
        header: entry.header,
        metricSlug: entry.metricSlug,
        aliases: entry.aliases,
        description: entry.description,
        evidenceCount: entry.evidenceCount,
        definitionVariants: entry.definitionVariants,
        sourcePath: filePath,
        sourceKind: "sheet_seed",
        source: "sheet-ingest",
        fieldKind: typeof entry.fieldKind === "string" ? entry.fieldKind : undefined,
        dataType: typeof entry.dataType === "string" ? entry.dataType : undefined,
        cursorPriority: typeof entry.cursorPriority === "string" ? entry.cursorPriority : undefined,
        bundleAmbiguity: typeof entry.bundleAmbiguity === "string" ? entry.bundleAmbiguity : undefined,
        primaryTopic: typeof entry.primaryTopic === "string" ? entry.primaryTopic : undefined,
      })),
    );

    return apiSuccess({
      success: true,
      filePath,
      parsedRows: rows.length,
      ingestableRows: prepared.length,
      datasetSource:
        path.extname(filePath).toLowerCase() === ".zip"
          ? bundleEntryByDataset(body.bundleDataset)
          : null,
      diagnostics,
      ...writeResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    logger.error("fast-pass memory ingest failed", {
      route: "/api/fast-pass/memory/ingest",
      error: message,
    });
    return apiError("Failed to ingest sheet memory", 500, message);
  }
}
