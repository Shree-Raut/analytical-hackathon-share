import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { PageHeader } from "@/components/analytics/page-header";
import { CompanyMenuContent } from "./company-menu-content";

function assignFolder(category: string, templateType: string): string {
  const cat = category.toLowerCase();
  const type = templateType.toLowerCase();

  if (cat === "operations" || type === "operations" || type === "operational")
    return "weekly";
  if (
    cat === "accounting" ||
    cat === "financial" ||
    type === "financial" ||
    type === "accounting"
  )
    return "monthly";
  if (cat === "portfolio" || type === "portfolio" || type === "regional")
    return "regional";
  return "adhoc";
}

export default async function CompanyMenuPage() {
  const customerId = await getActiveCustomerId();

  if (!customerId) {
    return (
      <div className="p-8 max-w-6xl">
        <PageHeader
          title="Company Menu"
          description="Your organization's official reports and dashboards"
        />
        <p className="text-[#7d654e] text-sm">No customer data available.</p>
      </div>
    );
  }

  const reports = await prisma.customerReport.findMany({
    where: { customerId },
    include: {
      template: {
        select: { name: true, slug: true, category: true, templateType: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = reports.map((r) => ({
    id: r.id,
    name: r.name,
    tier: r.tier,
    ownerId: r.ownerId,
    teamId: r.teamId,
    updatedAt: r.updatedAt.toISOString(),
    folder: assignFolder(r.template.category, r.template.templateType),
    template: {
      name: r.template.name,
      slug: r.template.slug,
      category: r.template.category,
      templateType: r.template.templateType,
    },
  }));

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Company Menu"
        description="Your organization's official reports and dashboards"
      />
      <CompanyMenuContent reports={serialized} />
    </div>
  );
}
