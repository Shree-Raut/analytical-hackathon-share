import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { PageHeader } from "@/components/analytics/page-header";
import { MetricsBrowser } from "./_components/metrics-browser";

export default async function MetricDefinitionsPage() {
  const customerId = await getActiveCustomerId();

  const rawMetrics = await prisma.metricDefinition.findMany({
    include: {
      customerOverrides: {
        where: { customerId },
        select: {
          id: true,
          customerId: true,
          formula: true,
          label: true,
          description: true,
        },
      },
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const metrics = rawMetrics.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description,
    formula: m.formula,
    format: m.format,
    category: m.category,
    sourceSystem: m.sourceSystem,
    dimensions: m.dimensions,
    certificationTier: m.certificationTier,
    customerOverrides: m.customerOverrides.map((o) => ({
      id: o.id,
      customerId: o.customerId,
      formula: o.formula,
      label: o.label,
      description: o.description,
    })),
  }));

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Metric Definitions"
        description="Browse and manage your analytics semantic layer"
      />
      <MetricsBrowser metrics={metrics} />
    </div>
  );
}
