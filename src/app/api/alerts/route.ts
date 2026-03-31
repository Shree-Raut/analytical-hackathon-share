import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const customerId = cookieStore.get("activeCustomerId")?.value;

  const alerts = await prisma.alert.findMany({
    where: customerId ? { rule: { customerId } } : {},
    include: {
      rule: {
        include: {
          metric: { select: { name: true, slug: true, format: true } },
        },
      },
    },
    orderBy: { triggeredAt: "desc" },
  });

  const propertyIds = [
    ...new Set(alerts.map((a) => a.propertyId).filter(Boolean)),
  ] as string[];

  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    select: { id: true, name: true, slug: true },
  });
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const enriched = alerts.map((alert) => ({
    id: alert.id,
    severity: alert.severity,
    status: alert.status,
    currentValue: alert.currentValue,
    thresholdValue: alert.thresholdValue,
    triggeredAt: alert.triggeredAt.toISOString(),
    resolvedAt: alert.resolvedAt?.toISOString() ?? null,
    snoozedUntil: alert.snoozedUntil?.toISOString() ?? null,
    acknowledgedBy: alert.acknowledgedBy,
    aiExplanation: alert.aiExplanation,
    property: alert.propertyId
      ? propertyMap.get(alert.propertyId) ?? null
      : null,
    metricName: alert.rule.metric.name,
    metricSlug: alert.rule.metric.slug,
    metricFormat: alert.rule.metric.format,
    alertType: alert.rule.alertType,
  }));

  return NextResponse.json(enriched);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status, acknowledgedBy, snoozedUntil } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = { status };
  if (acknowledgedBy) updateData.acknowledgedBy = acknowledgedBy;
  if (snoozedUntil) updateData.snoozedUntil = new Date(snoozedUntil);
  if (status === "RESOLVED") updateData.resolvedAt = new Date();

  const alert = await prisma.alert.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(alert);
}
