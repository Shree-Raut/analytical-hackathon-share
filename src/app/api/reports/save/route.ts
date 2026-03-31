import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, name, filters, tier, columns, data } = body;

    if (!templateId || !name) {
      return NextResponse.json(
        { error: "templateId and name are required" },
        { status: 400 },
      );
    }

    // Verify the template exists
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const cookieCustomerId = cookieStore.get("activeCustomerId")?.value;

    let customerId = cookieCustomerId;
    if (!customerId) {
      const first = await prisma.customer.findFirst({
        orderBy: { createdAt: "asc" },
      });
      customerId = first?.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No customer found" },
        { status: 404 },
      );
    }

    const report = await prisma.customerReport.create({
      data: {
        customerId,
        templateId,
        name,
        filters: JSON.stringify(filters || {}),
        layoutOverrides: JSON.stringify({ columns: columns || [], data: data || [] }),
        tier: tier || "PERSONAL",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 },
    );
  }
}
