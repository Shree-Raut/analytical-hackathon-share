import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const metric = await prisma.metricDefinition.findUnique({
      where: { id },
      include: {
        customerOverrides: true,
        thresholds: true,
        alertRules: true,
      },
    });

    if (!metric) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 });
    }

    return NextResponse.json(metric);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch metric" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.dimensions && typeof body.dimensions !== "string") {
      body.dimensions = JSON.stringify(body.dimensions);
    }

    const metric = await prisma.metricDefinition.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(metric);
  } catch {
    return NextResponse.json(
      { error: "Failed to update metric" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.alert.deleteMany({
      where: { rule: { metricId: id } },
    });
    await prisma.alertRule.deleteMany({ where: { metricId: id } });
    await prisma.contextualThreshold.deleteMany({ where: { metricId: id } });
    await prisma.customerMetricOverride.deleteMany({ where: { baseMetricId: id } });
    await prisma.metricDataPoint.deleteMany({ where: { metricId: id } });
    await prisma.metricDefinition.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete metric" },
      { status: 500 },
    );
  }
}
