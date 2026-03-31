import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { PageHeader } from "@/components/analytics/page-header";
import { ThresholdConfig } from "./_components/threshold-config";

export default async function ThresholdsPage() {
  const customerId = await getActiveCustomerId();

  const alertRules = await prisma.alertRule.findMany({
    where: { customerId },
    include: {
      metric: { select: { id: true, name: true, slug: true, format: true } },
      alerts: {
        where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
        select: { id: true, currentValue: true, severity: true },
        take: 1,
        orderBy: { triggeredAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const thresholds = await prisma.contextualThreshold.findMany({
    where: { customerId },
    include: {
      metric: { select: { id: true, name: true, slug: true, format: true } },
    },
    orderBy: { priority: "desc" },
  });

  const latestPeriod = await prisma.metricDataPoint.findFirst({
    where: { customerId },
    orderBy: { period: "desc" },
    select: { period: true },
  });

  const currentValues = await prisma.metricDataPoint.groupBy({
    by: ["metricId"],
    where: {
      customerId,
      period: latestPeriod?.period ?? "2026-03",
    },
    _avg: { value: true },
  });

  const currentValueMap = new Map(
    currentValues.map((cv) => [cv.metricId, cv._avg.value ?? 0])
  );

  const serializedRules = alertRules.map((rule) => {
    let config: Record<string, any> = {};
    try { config = JSON.parse(rule.config); } catch {}
    let channels: string[] = [];
    try { channels = JSON.parse(rule.channels); } catch {}

    return {
      id: rule.id,
      metricName: rule.metric.name,
      metricFormat: rule.metric.format,
      alertType: rule.alertType,
      severity: rule.severity,
      isActive: rule.isActive,
      channels,
      config,
      currentValue: currentValueMap.get(rule.metric.id) ?? null,
      hasActiveAlert: rule.alerts.length > 0,
      activeAlertSeverity: rule.alerts[0]?.severity ?? null,
    };
  });

  const serializedThresholds = thresholds.map((t) => ({
    id: t.id,
    metricName: t.metric.name,
    metricFormat: t.metric.format,
    greenThreshold: t.greenThreshold,
    yellowThreshold: t.yellowThreshold,
    redThreshold: t.redThreshold,
    priority: t.priority,
    isActive: t.isActive,
    currentValue: currentValueMap.get(t.metric.id) ?? null,
    dimensionFilters: t.dimensionFilters,
  }));

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Thresholds & Alerts"
        description="Configure alert rules and sensitivity across your portfolio"
      />
      <ThresholdConfig
        rules={serializedRules}
        thresholds={serializedThresholds}
      />
    </div>
  );
}
