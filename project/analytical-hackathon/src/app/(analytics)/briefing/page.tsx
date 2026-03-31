import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { BriefingAlerts } from "./_components/briefing-alerts";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

export default async function BriefingPage() {
  const customerId = await getActiveCustomerId();

  const latestPoint = await prisma.metricDataPoint.findFirst({
    where: { customerId },
    orderBy: { period: "desc" },
    select: { period: true },
  });
  const latestPeriod = latestPoint?.period ?? "2026-03";

  const openAlerts = await prisma.alert.findMany({
    where: {
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
      rule: { customerId },
    },
    include: {
      rule: {
        include: {
          metric: { select: { name: true, slug: true, format: true } },
        },
      },
    },
    orderBy: { triggeredAt: "desc" },
  });

  const properties = await prisma.property.findMany({
    where: { customerId },
    select: { id: true, name: true, unitCount: true },
  });
  const propertyMap = new Map(properties.map((p) => [p.id, p]));
  const totalUnits = properties.reduce((s, p) => s + p.unitCount, 0);

  const enrichedAlerts = openAlerts.map((alert) => ({
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
  }));

  const severityOrder: Record<string, number> = { CRITICAL: 0, WARNING: 1 };
  enrichedAlerts.sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9),
  );

  const criticalAlerts = enrichedAlerts.filter(
    (a) => a.severity === "CRITICAL",
  );
  const warningAlerts = enrichedAlerts.filter((a) => a.severity === "WARNING");

  const propertiesWithAlerts = new Set(
    openAlerts.filter((a) => a.propertyId).map((a) => a.propertyId!),
  );

  const [occupancyMetric, noiMetric, aiHoursMetric, collectionsMetric] =
    await Promise.all([
      prisma.metricDefinition.findFirst({
        where: { slug: "occupancy_rate" },
        select: { id: true },
      }),
      prisma.metricDefinition.findFirst({
        where: { slug: "noi" },
        select: { id: true },
      }),
      prisma.metricDefinition.findFirst({
        where: { slug: "ai_hours_saved" },
        select: { id: true },
      }),
      prisma.metricDefinition.findFirst({
        where: { slug: "collections_rate" },
        select: { id: true },
      }),
    ]);

  const [occupancyAgg, noiAgg, aiHoursAgg, collectionsAgg] = await Promise.all(
    [
      occupancyMetric
        ? prisma.metricDataPoint.aggregate({
            where: { metricId: occupancyMetric.id, period: latestPeriod, customerId },
            _avg: { value: true },
          })
        : null,
      noiMetric
        ? prisma.metricDataPoint.aggregate({
            where: { metricId: noiMetric.id, period: latestPeriod, customerId },
            _sum: { value: true },
          })
        : null,
      aiHoursMetric
        ? prisma.metricDataPoint.aggregate({
            where: { metricId: aiHoursMetric.id, period: latestPeriod, customerId },
            _sum: { value: true },
          })
        : null,
      collectionsMetric
        ? prisma.metricDataPoint.aggregate({
            where: { metricId: collectionsMetric.id, period: latestPeriod, customerId },
            _avg: { value: true },
          })
        : null,
    ],
  );

  const portfolioOccupancy = occupancyAgg?._avg?.value ?? 0;
  const totalNoi = noiAgg?._sum?.value ?? 0;
  const aiHoursSaved = aiHoursAgg?._sum?.value ?? 0;
  const propertiesOnTrack = properties.length - propertiesWithAlerts.size;
  const avgCollections = collectionsAgg?._avg?.value ?? 0;

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1510] tracking-tight">
          Good morning.
        </h1>
        <p className="text-sm text-[#7d654e] mt-1">{formatDate(new Date())}</p>
      </div>

      {/* Portfolio Health — the good news first */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Building2 size={18} className="text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">+0.3%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1a1510] tabular-nums">
            {portfolioOccupancy.toFixed(1)}%
          </div>
          <div className="text-xs text-[#7d654e] mt-0.5">Portfolio Occupancy</div>
        </div>

        <div className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign size={18} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">+2.1%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1a1510] tabular-nums">
            {totalNoi >= 1_000_000
              ? `$${(totalNoi / 1_000_000).toFixed(1)}M`
              : `$${(totalNoi / 1_000).toFixed(0)}K`}
          </div>
          <div className="text-xs text-[#7d654e] mt-0.5">Net Operating Income</div>
        </div>

        <div className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">+12%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1a1510] tabular-nums">
            {Math.round(aiHoursSaved).toLocaleString()}
          </div>
          <div className="text-xs text-[#7d654e] mt-0.5">AI Hours Saved This Month</div>
        </div>

        <div className="bg-white border border-[#e8dfd4] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users size={18} className="text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1a1510] tabular-nums">
            {avgCollections.toFixed(1)}%
          </div>
          <div className="text-xs text-[#7d654e] mt-0.5">Avg Collection Rate</div>
        </div>
      </div>

      {/* Portfolio summary bar */}
      <div className="flex items-center justify-between bg-white border border-[#e8dfd4] rounded-xl px-6 py-4 shadow-sm mb-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-[#1a1510]">{propertiesOnTrack}</span>
            <span className="text-sm text-[#7d654e]">on track</span>
          </div>
          <div className="w-px h-4 bg-[#e8dfd4]" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-[#1a1510]">{warningAlerts.length}</span>
            <span className="text-sm text-[#7d654e]">need attention</span>
          </div>
          <div className="w-px h-4 bg-[#e8dfd4]" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-[#1a1510]">{criticalAlerts.length}</span>
            <span className="text-sm text-[#7d654e]">critical</span>
          </div>
        </div>
        <div className="text-sm text-[#7d654e]">
          {properties.length} properties · {totalUnits.toLocaleString()} units
        </div>
      </div>

      {/* Exceptions — only if there are alerts */}
      {enrichedAlerts.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[#1a1510]">
              Needs your attention
            </h2>
            <Link
              href="/alerts"
              className="flex items-center gap-1 text-sm text-[#7d654e] hover:text-[#1a1510] transition-colors"
            >
              View all alerts <ArrowRight size={14} />
            </Link>
          </div>

          {/* Critical */}
          {criticalAlerts.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  Critical · {criticalAlerts.length}
                </span>
              </div>
              <BriefingAlerts alerts={criticalAlerts} />
            </section>
          )}

          {/* Warning */}
          {warningAlerts.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Warning · {warningAlerts.length}
                </span>
              </div>
              <BriefingAlerts alerts={warningAlerts} />
            </section>
          )}
        </div>
      )}

      {/* Everything Else — the positive close */}
      <section className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <h2 className="text-sm font-semibold text-emerald-700">
            Everything else is on track
          </h2>
        </div>
        <p className="text-sm text-emerald-900/60 mb-4">
          {propertiesOnTrack} of {properties.length} properties are performing within expected thresholds.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/reports"
            className="text-sm text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
          >
            Browse reports →
          </Link>
          <Link
            href="/create"
            className="text-sm text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
          >
            Create a report →
          </Link>
          <Link
            href="/"
            className="text-sm text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
          >
            View Platform Pulse →
          </Link>
        </div>
      </section>
    </div>
  );
}
