import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("activeCustomerId")?.value;

    if (!customerId) {
      return NextResponse.json(
        { error: "No active customer" },
        { status: 400 },
      );
    }

    const reports = await prisma.customerReport.findMany({
      where: { customerId },
      include: {
        template: {
          select: { name: true, slug: true, category: true, templateType: true },
        },
      },
      orderBy: [{ menuFolder: "asc" }, { name: "asc" }],
    });

    const folderMap = new Map<string, typeof reports>();

    for (const report of reports) {
      const folder = report.menuFolder || report.template.category || "Uncategorized";
      if (!folderMap.has(folder)) folderMap.set(folder, []);
      folderMap.get(folder)!.push(report);
    }

    const folders = Array.from(folderMap.entries()).map(([name, folderReports]) => ({
      name,
      reports: folderReports.map((r) => ({
        id: r.id,
        name: r.name,
        templateSlug: r.template.slug,
        templateType: r.template.templateType,
        tier: r.tier,
        menuFolder: r.menuFolder,
      })),
    }));

    return NextResponse.json({ folders });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch company menu" },
      { status: 500 },
    );
  }
}
