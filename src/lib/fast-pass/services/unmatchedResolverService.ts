export interface ResolvePromptInput {
  sourceHeader: string;
  bundleCandidates: Array<{
    slug: string;
    score: number;
    kind?: string;
    type?: string | null;
    definition?: string;
  }>;
}

export function buildUnmatchedResolvePrompt(
  llmPayload: ResolvePromptInput[],
  metrics: Array<{ slug: string; name: string; category: string }>,
) {
  return `You are resolving unmatched report column headers.
For each header, choose the best matching metric slug from the available metrics list,
or respond "unresolved" if no good match exists.

Return STRICT JSON:
{
  "resolutions": [
    { "sourceHeader": "string", "metricSlug": "string or null", "confidence": 0-100, "reason": "string" }
  ]
}

Available metrics (first 200):
${JSON.stringify(metrics)}

Headers to resolve:
${JSON.stringify(llmPayload)}`;
}

export function normalizeResolveResult(input: unknown): {
  sourceHeader: string;
  metricSlug: string | null;
  confidence: number;
  reason: string;
}[] {
  if (!input || typeof input !== "object" || !Array.isArray((input as { resolutions?: unknown[] }).resolutions)) {
    return [];
  }
  const rows = (input as { resolutions: unknown[] }).resolutions;
  const normalized: Array<{ sourceHeader: string; metricSlug: string | null; confidence: number; reason: string }> = [];
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const sourceHeader = typeof row.sourceHeader === "string" ? row.sourceHeader : "";
    const metricSlug = typeof row.metricSlug === "string" ? row.metricSlug : null;
    const confidence = Number(row.confidence) || 0;
    const reason = typeof row.reason === "string" ? row.reason : "";
    if (sourceHeader) normalized.push({ sourceHeader, metricSlug, confidence, reason });
  }
  return normalized;
}
