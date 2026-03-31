import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { PageHeader } from "@/components/analytics/page-header";
import { WorkspaceContent } from "./workspace-content";

export default async function WorkspacePage() {
  const customerId = await getActiveCustomerId();

  const savedReports = customerId
    ? await prisma.customerReport.findMany({
        where: {
          customerId,
          tier: "PERSONAL",
        },
        include: {
          template: { select: { slug: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      })
    : [];

  const pinnedQueries = customerId
    ? await prisma.savedQuery.findMany({
        where: {
          customerId,
          isPinned: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="My Workspace"
        description="Your drafts, saved reports, and pinned insights"
      />
      <WorkspaceContent
        savedReports={savedReports.map((r) => ({
          id: r.id,
          name: r.name,
          updatedAt: r.updatedAt.toISOString(),
          templateSlug: r.template.slug,
        }))}
        pinnedQueries={pinnedQueries.map((q) => ({
          id: q.id,
          question: q.question,
          createdAt: q.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
