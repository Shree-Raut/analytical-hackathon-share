import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/analytics/page-header";
import { ReportLibraryContent } from "./report-library-content";

export default async function ReportsPage() {
  const templates = await prisma.reportTemplate.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const serialized = templates.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    category: t.category,
    templateType: t.templateType,
    metricRefs: t.metricRefs,
    isActive: t.isActive,
  }));

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Report Library"
        description="Browse and customize standard reports"
      />
      <ReportLibraryContent templates={serialized} />
    </div>
  );
}
