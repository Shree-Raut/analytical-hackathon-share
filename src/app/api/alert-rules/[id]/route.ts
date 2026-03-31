import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.config && typeof body.config !== "string") {
      body.config = JSON.stringify(body.config);
    }
    if (body.channels && typeof body.channels !== "string") {
      body.channels = JSON.stringify(body.channels);
    }
    if (body.dimensionFilters && typeof body.dimensionFilters !== "string") {
      body.dimensionFilters = JSON.stringify(body.dimensionFilters);
    }
    if (body.hysteresis && typeof body.hysteresis !== "string") {
      body.hysteresis = JSON.stringify(body.hysteresis);
    }

    const rule = await prisma.alertRule.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(rule);
  } catch {
    return NextResponse.json(
      { error: "Failed to update alert rule" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.alert.deleteMany({ where: { ruleId: id } });
    await prisma.alertRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete alert rule" },
      { status: 500 },
    );
  }
}
