import { prisma } from "@/lib/db";
import { listSemanticMetrics } from "@/lib/semantic-layer/adapter";

function asCleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function isUsableMetric(name: string, slug: string): boolean {
  const compactNameLength = name.replace(/[^a-z0-9]/gi, "").length;
  const compactSlugLength = slug.replace(/[^a-z0-9]/gi, "").length;
  return compactNameLength >= 3 && compactSlugLength >= 3;
}

export async function buildMappingCatalog(semanticTenantId: string | null) {
  const metrics = await prisma.metricDefinition.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, format: true, category: true },
  });
  const semanticMetrics = await listSemanticMetrics(semanticTenantId);
  const mergedMetrics = [
    ...metrics,
    ...semanticMetrics
      .filter((metric) => !metrics.some((m) => m.slug === metric.slug))
      .map((metric) => ({
        id: metric.id,
        name: metric.name,
        slug: metric.slug,
        format: metric.format,
        category: metric.category,
      })),
  ].filter((m) => isUsableMetric(m.name, m.slug));

  const templates = await prisma.reportTemplate.findMany({
    where: { isActive: true },
    select: { metricRefs: true },
  });
  const templateHeaders = new Set<string>();
  for (const t of templates) {
    try {
      const refs = JSON.parse(t.metricRefs);
      if (!Array.isArray(refs)) continue;
      for (const ref of refs) {
        if (typeof ref === "string") {
          const label = asCleanLabel(ref);
          if (label) templateHeaders.add(label);
        } else if (ref && typeof ref === "object") {
          if (Array.isArray((ref as { columnHeaders?: unknown[] }).columnHeaders)) {
            for (const h of (ref as { columnHeaders: unknown[] }).columnHeaders) {
              const label = asCleanLabel(h);
              if (label) templateHeaders.add(label);
            }
          }
          const label = asCleanLabel((ref as { label?: unknown }).label);
          const name = asCleanLabel((ref as { name?: unknown }).name);
          if (label) templateHeaders.add(label);
          if (name) templateHeaders.add(name);
        }
      }
    } catch {
      // skip invalid metricRefs
    }
  }

  return { mergedMetrics, templateHeaders: Array.from(templateHeaders) };
}
