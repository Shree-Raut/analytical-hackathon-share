import { entityRepo, measureRepo, versionRepo } from "@/lib/semantic-layer/repositories";
import { resolveSemanticTenantId } from "@/lib/semantic-layer/config";

export interface SemanticMetric {
  id: string;
  name: string;
  slug: string;
  format: "currency" | "percent" | "number" | "text";
  category: string;
  description: string;
  expression: string;
  source: "semantic_layer";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeMeasureSlug(name: string): string {
  const trimmed = name.trim().toLowerCase();
  if (/^[a-z0-9_]+$/.test(trimmed)) {
    return trimmed;
  }
  return slugify(name);
}

function inferFormat(expression: string): SemanticMetric["format"] {
  const e = expression.toLowerCase();
  if (e.includes("%") || e.includes(" / ")) return "percent";
  if (e.includes("rent") || e.includes("revenue") || e.includes("cost")) {
    return "currency";
  }
  return "number";
}

export async function listSemanticMetrics(
  requestedTenantId?: string | null,
): Promise<SemanticMetric[]> {
  const tenantId = resolveSemanticTenantId(requestedTenantId);
  try {
    const measures = await measureRepo.listMeasures(tenantId);
    return measures.map((measure) => ({
      id: measure.id,
      name: measure.displayName || measure.name,
      slug: normalizeMeasureSlug(measure.name),
      format: inferFormat(measure.expression),
      category:
        measure.measureType === "derived" ? "derived-semantic" : "base-semantic",
      description: measure.expression,
      expression: measure.expression,
      source: "semantic_layer" as const,
    }));
  } catch {
    return [];
  }
}

export async function getSemanticSchemaSnapshot(
  requestedTenantId?: string | null,
): Promise<{
  entities: Awaited<ReturnType<typeof entityRepo.listEntities>>;
  measures: Awaited<ReturnType<typeof measureRepo.listMeasures>>;
  version: string;
}> {
  const tenantId = resolveSemanticTenantId(requestedTenantId);
  try {
    const [entities, measures, latestVersion] = await Promise.all([
      entityRepo.listEntities(tenantId),
      measureRepo.listMeasures(tenantId),
      versionRepo.getLatestVersion(tenantId),
    ]);
    return {
      entities,
      measures,
      version: latestVersion?.version ?? "0.0.0",
    };
  } catch {
    return {
      entities: [],
      measures: [],
      version: "0.0.0",
    };
  }
}
