import { getSemanticSchemaSnapshot } from "@/lib/semantic-layer/adapter";
import { generateReport } from "@/lib/ai-engine";

function keywordize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export async function generateSemanticGuidedReport(
  prompt: string,
  customerId?: string,
) {
  const snapshot = await getSemanticSchemaSnapshot(customerId ?? null);
  if (snapshot.measures.length === 0) {
    return generateReport(prompt, customerId);
  }

  const promptTokens = new Set(keywordize(prompt));
  const matchedMeasures = snapshot.measures
    .map((measure) => ({
      name: measure.displayName || measure.name,
      score: keywordize(measure.displayName || measure.name).filter((token) =>
        promptTokens.has(token),
      ).length,
    }))
    .filter((measure) => measure.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const semanticHint = matchedMeasures.length
    ? `\nSemantic measures to prioritize: ${matchedMeasures
        .map((measure) => measure.name)
        .join(", ")}.`
    : "";

  return generateReport(`${prompt}${semanticHint}`, customerId);
}
