import type { MappingMemoryHint, MappingResult, MetricCandidate } from "./types";
import { normalizeMappingHeader } from "../repositories/learningRepository";

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function fuzzyScore(source: string, target: string): number {
  const s = source.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  const sNorm = s.replace(/[^a-z0-9]/g, "");
  const tNorm = t.replace(/[^a-z0-9]/g, "");
  if (s === t) return 100;
  if (sNorm === tNorm) return 95;
  if (
    sNorm.length >= 3 &&
    tNorm.length >= 3 &&
    (s.includes(t) || t.includes(s))
  ) {
    return 85;
  }
  const maxLen = Math.max(s.length, t.length);
  if (maxLen === 0) return 100;
  const dist = levenshtein(s, t);
  const ratio = 1 - dist / maxLen;
  if (ratio > 0.7) return Math.round(ratio * 80);
  return Math.round(ratio * 50);
}

function memoryBoost(
  header: string,
  metricSlug: string,
  memoryHints: MappingMemoryHint[],
): number {
  const normalized = normalizeMappingHeader(header);
  const hit = memoryHints.find((hint) => {
    const sameHeader =
      hint.sourceHeader === header || hint.normalizedHeader === normalized;
    return sameHeader && hint.metricSlug === metricSlug;
  });
  if (!hit) return 0;
  let boost = Math.max(0, Math.min(15, Math.round(hit.confidenceScore)));
  if (hit.cursorPriority === "review") boost = Math.max(0, boost - 5);
  return boost;
}

export function buildDeterministicMappings(params: {
  headers: string[];
  metrics: MetricCandidate[];
  templateHeaders: string[];
  memoryHints?: MappingMemoryHint[];
}): MappingResult[] {
  const memoryHints = params.memoryHints || [];

  return params.headers.map((header) => {
    const scored: { name: string; slug: string; confidence: number }[] = [];

    for (const metric of params.metrics) {
      const nameScore = fuzzyScore(header, metric.name);
      const slugScore = fuzzyScore(
        header,
        metric.slug.replace(/-/g, " ").replace(/_/g, " "),
      );
      const boost = memoryBoost(header, metric.slug, memoryHints);
      const best = Math.max(nameScore, slugScore) + boost;
      if (best > 30) {
        scored.push({
          name: metric.name,
          slug: metric.slug,
          confidence: Math.min(100, best),
        });
      }
    }

    for (const templateHeader of params.templateHeaders) {
      const score = fuzzyScore(header, templateHeader);
      if (score <= 30) continue;
      const matchedMetric = params.metrics.find(
        (metric) =>
          metric.name.toLowerCase() === templateHeader.toLowerCase() ||
          metric.slug === templateHeader.toLowerCase().replace(/\s+/g, "-"),
      );
      if (!matchedMetric) continue;
      const existing = scored.find((item) => item.slug === matchedMetric.slug);
      if (existing) {
        existing.confidence = Math.max(existing.confidence, score);
      } else {
        scored.push({
          name: matchedMetric.name,
          slug: matchedMetric.slug,
          confidence: score,
        });
      }
    }

    scored.sort(
      (a, b) =>
        b.confidence - a.confidence ||
        b.name.length - a.name.length ||
        a.slug.localeCompare(b.slug),
    );

    const top = scored[0];
    const memoryDriven =
      top &&
      memoryHints.some((hint) => hint.sourceHeader === header && hint.metricSlug === top.slug);
    return {
      sourceHeader: header,
      matchedMetric: top?.name ?? null,
      matchedSlug: top?.slug ?? null,
      confidence: top?.confidence ?? 0,
      alternatives: scored.slice(0, 5),
      matchSource: memoryDriven ? "memory_first" : "deterministic",
      rationale: memoryDriven ? "Memory-guided header match" : undefined,
      policyDecision: memoryDriven ? "memory_locked" : "deterministic_only",
    } satisfies MappingResult;
  });
}
