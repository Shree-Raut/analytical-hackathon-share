import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { PageHeader } from "@/components/analytics/page-header";
import { AlertsFeed } from "./_components/alerts-feed";

function formatAlertValue(
  value: number,
  metricFormat: string,
  alertType: string,
): string {
  if (alertType === "VARIANCE") {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  }
  switch (metricFormat) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "currency":
      return value >= 1_000_000
        ? `$${(value / 1_000_000).toFixed(1)}M`
        : value >= 1_000
          ? `$${(value / 1_000).toFixed(1)}K`
          : `$${value.toLocaleString()}`;
    case "number":
      return Math.round(value).toLocaleString();
    default:
      return value.toString();
  }
}

export default async function AlertsPage() {
  const customerId = await getActiveCustomerId();

  const rawAlerts = await prisma.alert.findMany({
    where: { rule: { customerId } },
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
    ...new Set(rawAlerts.map((a) => a.propertyId).filter(Boolean)),
  ] as string[];
  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    select: { id: true, name: true },
  });
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const alerts = rawAlerts.map((alert) => ({
    id: alert.id,
    severity: alert.severity,
    status: alert.status,
    propertyName: alert.propertyId
      ? (propertyMap.get(alert.propertyId)?.name ?? "Unknown")
      : "Portfolio",
    metricName: alert.rule.metric.name,
    currentValue: formatAlertValue(
      alert.currentValue,
      alert.rule.metric.format,
      alert.rule.alertType,
    ),
    thresholdValue:
      alert.thresholdValue != null
        ? formatAlertValue(
            alert.thresholdValue,
            alert.rule.metric.format,
            alert.rule.alertType,
          )
        : "—",
    aiExplanation: alert.aiExplanation ?? "",
    triggeredAt: alert.triggeredAt.toISOString(),
    resolvedAt: alert.resolvedAt?.toISOString() ?? null,
    acknowledgedBy: alert.acknowledgedBy ?? null,
  }));

  // Sort: active first (CRITICAL > WARNING), then resolved, then by triggeredAt desc
  const severityRank: Record<string, number> = { CRITICAL: 0, WARNING: 1 };
  const statusRank: Record<string, number> = {
    OPEN: 0,
    ACKNOWLEDGED: 1,
    SNOOZED: 2,
    RESOLVED: 3,
  };

  alerts.sort((a, b) => {
    const statusDiff =
      (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    const severityDiff =
      (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
    if (severityDiff !== 0) return severityDiff;
    return (
      new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    );
  });

  const counts = {
    all: alerts.length,
    critical: alerts.filter(
      (a) => a.severity === "CRITICAL" && a.status !== "RESOLVED",
    ).length,
    warning: alerts.filter(
      (a) => a.severity === "WARNING" && a.status !== "RESOLVED",
    ).length,
    resolved: alerts.filter((a) => a.status === "RESOLVED").length,
  };

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Alerts"
        description="Active alerts and exceptions across your portfolio"
      />
      <AlertsFeed alerts={alerts} counts={counts} />
    </div>
  );
}
