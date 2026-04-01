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

  // Fetch scheduled reports
  const scheduledReports = customerId
    ? await prisma.reportSchedule.findMany({
        where: {
          report: { customerId },
          isActive: true,
        },
        include: {
          report: {
            select: {
              id: true,
              name: true,
              templateId: true,
              layoutOverrides: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
          layoutOverrides: r.layoutOverrides,
        }))}
        pinnedQueries={pinnedQueries.map((q) => ({
          id: q.id,
          question: q.question,
          createdAt: q.createdAt.toISOString(),
        }))}
        scheduledReports={scheduledReports.map((s) => ({
          id: s.id,
          reportId: s.reportId,
          reportName: s.report.name,
          frequency: s.frequency,
          dayOfWeek: s.dayOfWeek,
          dayOfMonth: s.dayOfMonth,
          time: s.time,
          recipients: JSON.parse(s.recipients || "[]") as string[],
          format: s.format,
          lastSentAt: s.lastSentAt?.toISOString() || null,
          createdAt: s.createdAt.toISOString(),
          layoutOverrides: s.report.layoutOverrides,
        }))}
      />
    </div>
  );
}
