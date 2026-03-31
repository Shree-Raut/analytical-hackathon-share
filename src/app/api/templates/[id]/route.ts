import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const template = await prisma.reportTemplate.findUnique({
      where: { id },
      include: { customerReports: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.metricRefs && typeof body.metricRefs !== "string") {
      body.metricRefs = JSON.stringify(body.metricRefs);
    }
    if (body.defaultFilters && typeof body.defaultFilters !== "string") {
      body.defaultFilters = JSON.stringify(body.defaultFilters);
    }
    if (body.layoutConfig && typeof body.layoutConfig !== "string") {
      body.layoutConfig = JSON.stringify(body.layoutConfig);
    }

    const template = await prisma.reportTemplate.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(template);
  } catch {
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.reportSchedule.deleteMany({
      where: { report: { templateId: id } },
    });
    await prisma.customerReport.deleteMany({
      where: { templateId: id },
    });
    await prisma.reportTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
