import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { notFound } from "next/navigation";
import { ReportViewerContent } from "./report-viewer-content";
import { FinancialReportViewer } from "./financial-report-viewer";
import { MultiSectionReportViewer } from "./multi-section-report-viewer";
import { PivotSummaryReportViewer } from "./pivot-summary-report-viewer";
import type { MetricInfo } from "@/components/analytics/metric-popover";

const DATA_METRIC_SLUGS = [
  "occupancy_rate",
  "collections_rate",
  "noi",
  "delinquency_rate",
  "leasing_velocity",
  "work_orders_open",
  "ai_hours_saved",
];

const GL_METRIC_SLUGS = [
  "gross_potential_rent", "gain_to_lease", "loss_to_lease", "vacancy_loss",
  "concessions", "bad_debt", "other_income", "net_rental_income", "effective_gross_income",
  "payroll", "repairs_maintenance", "utilities", "marketing_expense",
  "administrative", "contract_services",
  "insurance", "taxes", "property_taxes", "management_fee",
  "capital_expenditures",
  "controllable_expense", "total_controllable_expense",
  "non_controllable_expense", "total_non_controllable_expense",
  "total_operating_expense", "noi", "net_operating_income",
];

const MULTI_SECTION_METRIC_SLUGS = [
  "occupancy_rate", "leasing_velocity", "delinquency_rate", "collections_rate",
  "work_orders_open", "ai_hours_saved", "noi", "gross_potential_rent",
  "effective_gross_income", "loss_to_lease", "vacancy_loss",
  "move_ins", "move_outs", "leases_signed", "lead_volume", "tours_scheduled",
  "applications_received", "renewal_rate",
];

const PIVOT_METRIC_SLUGS = [
  "occupancy_rate", "leasing_velocity", "delinquency_rate", "collections_rate",
  "noi", "gross_potential_rent", "effective_gross_income", "loss_to_lease",
  "bad_debt", "total_operating_expense", "expense_ratio", "noi_margin",
  "ai_conversations", "ai_hours_saved", "ai_cost_savings", "ai_escalation_rate",
  "move_ins", "move_outs", "leases_signed", "renewal_rate",
  "revenue_per_unit", "expense_per_unit",
];

const FINANCIAL_TEMPLATE_TYPES = new Set(["financial", "misc"]);
const MULTI_SECTION_SLUGS = new Set([
  "box-score", "daily-operations", "daily-and-weekly-operations",
  "executive-summary", "operations-summary",
]);
const PIVOT_SUMMARY_SLUGS = new Set([
  "lease-trade-out", "occupancy-vacancy", "pre-lease",
  "forecasted-occupancy", "property-pulse",
  "lead-and-lease-activity-formerly-property-pulse",
]);

type RendererType = "financial" | "multi-section" | "pivot-summary" | "data-table";

function detectRenderer(category: string, templateType: string, slug: string): RendererType {
  if (category.toLowerCase() === "accounting" && FINANCIAL_TEMPLATE_TYPES.has(templateType.toLowerCase())) {
    return "financial";
  }
  if (MULTI_SECTION_SLUGS.has(slug)) {
    return "multi-section";
  }
  if (PIVOT_SUMMARY_SLUGS.has(slug)) {
    return "pivot-summary";
  }
  return "data-table";
}

interface DataPointResult {
  metricSlug: string;
  metricName: string;
  metricFormat: string;
  propertyId: string;
  propertyName: string;
  period: string;
  value: number;
  previousValue: number | null;
  budgetValue: number | null;
}

interface PropertyResult {
  id: string;
  name: string;
  city: string;
  state: string;
  unitCount: number;
}

async function fetchMetricData(
  slugs: string[],
  customerId: string,
): Promise<{ dataPoints: DataPointResult[]; properties: PropertyResult[] }> {
  const metrics = await prisma.metricDefinition.findMany({
    where: { slug: { in: slugs } },
  });

  const properties = await prisma.property.findMany({
    where: { customerId },
    orderBy: { name: "asc" },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      metricId: { in: metrics.map((m) => m.id) },
      customerId,
    },
    include: {
      metric: { select: { slug: true, name: true, format: true } },
      property: { select: { id: true, name: true } },
    },
    orderBy: { period: "asc" },
  });

  return {
    dataPoints: dataPoints.map((dp) => ({
      metricSlug: dp.metric.slug,
      metricName: dp.metric.name,
      metricFormat: dp.metric.format,
      propertyId: dp.property.id,
      propertyName: dp.property.name,
      period: dp.period,
      value: dp.value,
      previousValue: dp.previousValue,
      budgetValue: dp.budgetValue,
    })),
    properties: properties.map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      state: p.state,
      unitCount: p.unitCount,
    })),
  };
}

function computeLatestPeriod(dataPoints: DataPointResult[]): string | undefined {
  let max: string | undefined;
  for (const dp of dataPoints) {
    if (!max || dp.period > max) max = dp.period;
  }
  return max;
}

async function fetchMetricGovernanceData(
  slugs: string[],
  customerId: string,
): Promise<{
  sourceSystems: Record<string, string>;
  metricDefinitions: Record<string, MetricInfo>;
}> {
  const metrics = await prisma.metricDefinition.findMany({
    where: { slug: { in: slugs } },
    include: {
      customerOverrides: {
        where: { customerId },
        take: 1,
        orderBy: { effectiveDate: "desc" },
      },
    },
  });

  const sourceSystems: Record<string, string> = {};
  const metricDefinitions: Record<string, MetricInfo> = {};

  for (const m of metrics) {
    if (m.sourceSystem) sourceSystems[m.slug] = m.sourceSystem;
    const override = m.customerOverrides[0];
    metricDefinitions[m.slug] = {
      name: m.name,
      formula: m.formula,
      format: m.format,
      sourceSystem: m.sourceSystem,
      certificationTier: m.certificationTier,
      override: override
        ? { formula: override.formula, label: override.label }
        : undefined,
    };
  }

  return { sourceSystems, metricDefinitions };
}

export default async function ReportViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ property?: string }>;
}) {
  const { slug } = await params;
  const { property: initialPropertyFilter } = await searchParams;

  const template = await prisma.reportTemplate.findUnique({
    where: { slug },
  });

  if (!template || !template.isActive) notFound();

  const renderer = detectRenderer(template.category, template.templateType, template.slug);
  const customerId = await getActiveCustomerId();

  if (renderer === "financial") {
    let financialData: {
      dataPoints: DataPointResult[];
      properties: PropertyResult[];
    } | null = null;

    if (customerId) {
      financialData = await fetchMetricData(GL_METRIC_SLUGS, customerId);
    }

    const latestPeriod = financialData ? computeLatestPeriod(financialData.dataPoints) : undefined;

    return (
      <div className="p-8 max-w-6xl">
        <FinancialReportViewer
          template={{
            id: template.id,
            name: template.name,
            slug: template.slug,
            description: template.description,
            category: template.category,
            templateType: template.templateType,
          }}
          glData={financialData?.dataPoints ?? []}
          properties={financialData?.properties ?? []}
          latestPeriod={latestPeriod}
        />
      </div>
    );
  }

  if (renderer === "multi-section") {
    let multiData: {
      dataPoints: DataPointResult[];
      properties: PropertyResult[];
    } | null = null;

    if (customerId) {
      multiData = await fetchMetricData(MULTI_SECTION_METRIC_SLUGS, customerId);
    }

    const latestPeriod = multiData ? computeLatestPeriod(multiData.dataPoints) : undefined;

    return (
      <div className="p-8 max-w-6xl">
        <MultiSectionReportViewer
          template={{
            id: template.id,
            name: template.name,
            slug: template.slug,
            description: template.description,
            category: template.category,
            templateType: template.templateType,
          }}
          propertyData={multiData?.dataPoints ?? []}
          properties={multiData?.properties ?? []}
          latestPeriod={latestPeriod}
        />
      </div>
    );
  }

  if (renderer === "pivot-summary") {
    let pivotData: {
      dataPoints: DataPointResult[];
      properties: PropertyResult[];
    } | null = null;

    if (customerId) {
      pivotData = await fetchMetricData(PIVOT_METRIC_SLUGS, customerId);
    }

    const latestPeriod = pivotData ? computeLatestPeriod(pivotData.dataPoints) : undefined;

    return (
      <div className="p-8 max-w-6xl">
        <PivotSummaryReportViewer
          template={{
            id: template.id,
            name: template.name,
            slug: template.slug,
            description: template.description,
            category: template.category,
            templateType: template.templateType,
          }}
          pivotData={pivotData?.dataPoints ?? []}
          properties={pivotData?.properties ?? []}
          latestPeriod={latestPeriod}
        />
      </div>
    );
  }

  if (!customerId) notFound();

  const metricSlugs: string[] = JSON.parse(template.metricRefs || "[]");

  const templateMetrics = await prisma.metricDefinition.findMany({
    where: { slug: { in: metricSlugs } },
  });

  const properties = await prisma.property.findMany({
    where: { customerId },
    orderBy: { name: "asc" },
  });

  const allDataMetrics = await prisma.metricDefinition.findMany({
    where: { slug: { in: DATA_METRIC_SLUGS } },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      metricId: { in: allDataMetrics.map((m) => m.id) },
      customerId,
    },
    include: {
      metric: { select: { slug: true, name: true, format: true } },
      property: { select: { id: true, name: true } },
    },
    orderBy: { period: "asc" },
  });

  const allSlugs = [...new Set([...metricSlugs, ...DATA_METRIC_SLUGS])];
  const governance = await fetchMetricGovernanceData(allSlugs, customerId);

  const mappedDataPoints = dataPoints.map((dp) => ({
    metricSlug: dp.metric.slug,
    metricName: dp.metric.name,
    metricFormat: dp.metric.format,
    propertyId: dp.property.id,
    propertyName: dp.property.name,
    period: dp.period,
    value: dp.value,
    previousValue: dp.previousValue,
    budgetValue: dp.budgetValue,
  }));

  const latestPeriod = computeLatestPeriod(mappedDataPoints);

  return (
    <div className="p-8 max-w-6xl">
      <ReportViewerContent
        template={{
          id: template.id,
          name: template.name,
          slug: template.slug,
          description: template.description,
          category: template.category,
          templateType: template.templateType,
          metricRefs: metricSlugs,
        }}
        metrics={templateMetrics.map((m) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          format: m.format,
          category: m.category,
        }))}
        properties={properties.map((p) => ({
          id: p.id,
          name: p.name,
          city: p.city,
          state: p.state,
          unitCount: p.unitCount,
        }))}
        dataPoints={mappedDataPoints}
        latestPeriod={latestPeriod}
        sourceSystems={governance.sourceSystems}
        metricDefinitions={governance.metricDefinitions}
        initialPropertyFilter={initialPropertyFilter}
      />
    </div>
  );
}
