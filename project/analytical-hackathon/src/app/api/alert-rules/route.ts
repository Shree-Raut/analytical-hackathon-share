import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
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

    const rules = await prisma.alertRule.findMany({
      where: { customerId },
      include: {
        metric: { select: { name: true, slug: true, format: true, category: true } },
        _count: { select: { alerts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rules);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch alert rules" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("activeCustomerId")?.value;

    if (!customerId) {
      return NextResponse.json(
        { error: "No active customer" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { metricId, alertType, config, severity, channels } = body;

    if (!metricId || !alertType) {
      return NextResponse.json(
        { error: "metricId and alertType are required" },
        { status: 400 },
      );
    }

    const rule = await prisma.alertRule.create({
      data: {
        customerId,
        metricId,
        alertType,
        config: config ? JSON.stringify(config) : "{}",
        severity: severity ?? "WARNING",
        channels: channels ? JSON.stringify(channels) : '["IN_APP"]',
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create alert rule" },
      { status: 500 },
    );
  }
}
