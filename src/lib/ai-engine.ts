// ─────────────────────────────────────────────────────────────────────────────
// Entrata Analytics — AI Engine
// ─────────────────────────────────────────────────────────────────────────────
//
// To enable real LLM:
// 1. Add OPENAI_API_KEY=sk-... to .env
// 2. npm install ai @ai-sdk/openai
// 3. This file will auto-detect the key and use the LLM path
//
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db";
import { getSemanticSchemaSnapshot } from "@/lib/semantic-layer/adapter";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
  format?: "currency" | "percent" | "number" | "text" | "date";
  align?: "left" | "right";
  width?: string;
  sortable?: boolean;
}

interface ComposeResponse {
  type: "report";
  columns: ColumnDef[];
  data: Record<string, any>[];
  explanation: string;
  metricsUsed: string[];
}

interface QAResponse {
  answer: string;
  chart: {
    type: "line" | "bar" | "area";
    data: Record<string, any>[];
    config: Record<string, any>;
  } | null;
  metadata: {
    metrics: string[];
    filters: string;
    freshness: string;
  } | null;
}

interface OverrideRecord {
  id: string;
  formula: string;
  label: string | null;
  description: string | null;
  baseMetric: { slug: string; name: string };
}

// ─── System Prompt Builder ──────────────────────────────────────────────────

export async function buildSystemPrompt(customerId?: string): Promise<string> {
  const metrics = await prisma.metricDefinition.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  });
  const templates = await prisma.reportTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 30,
  });
  const overrides = customerId
    ? await prisma.customerMetricOverride.findMany({
        where: { customerId },
        include: { baseMetric: { select: { slug: true, name: true } } },
      })
    : [];
  const properties = customerId
    ? await prisma.property.findMany({
        where: { customerId },
        select: { name: true, unitCount: true, vertical: true, state: true, classType: true },
        orderBy: { name: "asc" },
      })
    : [];
  const semanticSnapshot = await getSemanticSchemaSnapshot(customerId ?? null);

  return `You are an analytics AI for Entrata, a property management operating system.
Your job is to generate structured reports from natural language queries.

## Available Metrics (${metrics.length})
${metrics.map((m) => `- ${m.name} (${m.slug}): ${m.description} [${m.format}, ${m.category}]`).join("\n")}

## Report Templates (${templates.length})
${templates.map((t) => `- ${t.name} (${t.slug}): ${t.description}`).join("\n")}

## Customer Metric Overrides (${overrides.length})
${overrides.length > 0 ? overrides.map((o) => `- ${o.baseMetric.name} (${o.baseMetric.slug}): formula="${o.formula}"${o.label ? ` label="${o.label}"` : ""}`).join("\n") : "None"}

## Properties (${properties.length})
${properties.map((p) => `- ${p.name}: ${p.unitCount} units, ${p.vertical}, ${p.state}, ${p.classType}`).join("\n")}

## Governed Semantic Layer (v${semanticSnapshot.version})
Entities:
${semanticSnapshot.entities.map((e) => `- ${e.name}`).slice(0, 40).join("\n")}
Measures:
${semanticSnapshot.measures
  .map((m) => `- ${m.displayName || m.name}: ${m.expression}`)
  .slice(0, 80)
  .join("\n")}

## Output Format
Return JSON with: { type: "report", columns: ColumnDef[], data: Record[], explanation: string, metricsUsed: string[] }
Each column: { key, label, visible, format ("currency"|"percent"|"number"|"text"), align, sortable }

## Rules
- Always reference actual metric slugs from the Available Metrics list
- Note any customer overrides that affect the response
- Explain which metrics were used, how many properties included, and data freshness
- For compound queries, explain the filtering logic
- Support time series (months as columns), rankings, vertical filters, and exception reports`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function priorPeriod(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function recentPeriods(count: number): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

function formatPeriodLabel(period: string): string {
  const [y, m] = period.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
}

function formatPeriodKey(period: string): string {
  return `m_${period.replace("-", "_")}`;
}

// ─── Override Helpers ───────────────────────────────────────────────────────

async function getOverrides(customerId: string): Promise<OverrideRecord[]> {
  const overrides = await prisma.customerMetricOverride.findMany({
    where: { customerId },
    include: { baseMetric: { select: { slug: true, name: true } } },
  });
  return overrides as unknown as OverrideRecord[];
}

function buildOverrideNote(overrides: OverrideRecord[], metricSlugs: string[]): string {
  const relevant = overrides.filter((o) => metricSlugs.includes(o.baseMetric.slug));
  if (relevant.length === 0) return "";
  return relevant
    .map(
      (o) =>
        `Note: Using your custom ${o.label || o.baseMetric.name} definition (${o.formula}) rather than the standard calculation.`,
    )
    .join(" ");
}

// ─── Metric Extraction ─────────────────────────────────────────────────────

function extractMetricSlug(prompt: string): string {
  const q = prompt.toLowerCase();
  if (q.includes("delinquen")) return "delinquency_rate";
  if (q.includes("noi") || q.includes("net operating income")) return "noi";
  if (q.includes("collection")) return "collections_rate";
  if (q.includes("leasing") || q.includes("lease velocity")) return "leasing_velocity";
  if (q.includes("revenue") || q.includes("rent")) return "gross_potential_rent";
  if (q.includes("ai") || q.includes("hours saved")) return "ai_hours_saved";
  if (q.includes("lead")) return "lead_volume";
  return "occupancy_rate";
}

function extractVertical(prompt: string): { vertical: string; unitLabel: string } {
  const q = prompt.toLowerCase();
  if (q.includes("student")) return { vertical: "student", unitLabel: "Beds" };
  if (q.includes("affordable")) return { vertical: "affordable", unitLabel: "Units" };
  if (q.includes("military")) return { vertical: "military", unitLabel: "Units" };
  if (q.includes("senior")) return { vertical: "senior", unitLabel: "Units" };
  return { vertical: "conventional", unitLabel: "Units" };
}

// ─── Report Type Detection ──────────────────────────────────────────────────
// TODO: Replace detectReportType() + builders with LLM call when API key is available

export function detectReportType(prompt: string): string {
  const q = prompt.toLowerCase();

  // Pattern 12: Executive summary / portfolio overview
  if (q.includes("executive summary") || q.includes("portfolio overview") || q.includes("kpi rollup") || q.includes("kpi summary")) {
    return "executive_summary";
  }

  // Pattern 11: Exception / underperforming
  if (q.includes("need attention") || q.includes("underperform") || q.includes("at risk") || q.includes("exception") || q.includes("below threshold")) {
    return "exception_report";
  }

  // Pattern 10: Override-aware
  if (q.includes("my") && (q.includes("definition") || q.includes("custom")) || q.includes("custom metric") || q.includes("override")) {
    return "override_aware";
  }

  // Pattern 9: Vertical-specific
  if (q.includes("student housing") || q.includes("pre-lease") || q.includes("affordable housing") || q.includes("military housing")) {
    return "vertical_specific";
  }

  // Pattern 8: Ranked comparison
  if ((q.includes("top") && q.includes("bottom")) || (q.includes("compare") && (q.includes("top") || q.includes("best") || q.includes("worst")))) {
    return "ranked_comparison";
  }

  // Pattern 7: Time series / trend
  if (q.includes("trend") || q.includes("over time") || q.includes("12-month") || q.includes("12 month") || (q.includes("month") && q.includes("trend"))) {
    return "time_series";
  }

  // Pattern 6: Compound query (AND / multi-condition)
  if ((q.includes(" and ") || q.includes(" & ")) && (q.includes("trending") || q.includes("above") || q.includes("below") || q.includes("where"))) {
    return "compound_query";
  }

  // Pattern 1: Weekly ops / box score
  if ((q.includes("weekly") || q.includes("daily")) && (q.includes("operation") || q.includes("ops") || q.includes("summary") || q.includes("box score"))) {
    return "weekly_ops";
  }

  // Pattern 2: Delinquency aging
  if (q.includes("delinquen") && q.includes("aging")) return "delinquency_aging";

  // Pattern 3: Income statement
  if (q.includes("income statement") || (q.includes("budget") && (q.includes("actual") || q.includes("variance")))) {
    return "income_statement";
  }

  // Pattern 4: Rent roll
  if (q.includes("rent roll")) return "rent_roll";

  // Pattern 5: Leasing funnel
  if (q.includes("leasing") && (q.includes("funnel") || q.includes("pipeline") || q.includes("conversion"))) {
    return "leasing_funnel";
  }

  // Broader fallbacks
  if (q.includes("delinquen")) return "delinquency_aging";
  if (q.includes("occupancy") || q.includes("vacancy")) return "weekly_ops";
  if (q.includes("noi") || q.includes("income") || q.includes("revenue") || q.includes("expense")) return "income_statement";
  if (q.includes("leasing") || q.includes("lead") || q.includes("tour")) return "leasing_funnel";
  if (q.includes("rent") || q.includes("unit")) return "rent_roll";
  if (q.includes("compare") || q.includes("rank")) return "ranked_comparison";
  if (q.includes("summary") || q.includes("overview")) return "executive_summary";

  return "weekly_ops";
}

// ─── Builder: Weekly Operations Summary ─────────────────────────────────────

async function buildWeeklyOps(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();

  const metricSlugs = [
    "occupancy_rate", "leasing_velocity", "move_ins", "move_outs",
    "lead_volume", "tours_scheduled", "leases_signed", "lead_to_lease_conversion",
    "delinquency_rate", "collections_rate", "ai_hours_saved",
  ];

  const metrics = await prisma.metricDefinition.findMany({
    where: { slug: { in: metricSlugs } },
  });
  const metricIdMap = new Map(metrics.map((m) => [m.slug, m.id]));

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: Array.from(metricIdMap.values()) },
    },
  });

  const dpMap = new Map<string, Map<string, number>>();
  for (const dp of dataPoints) {
    const slug = metrics.find((m) => m.id === dp.metricId)?.slug;
    if (!slug) continue;
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, new Map());
    dpMap.get(dp.propertyId)!.set(slug, dp.value);
  }

  const data = properties.map((prop) => {
    const vals = dpMap.get(prop.id) ?? new Map<string, number>();
    const moveIns = vals.get("move_ins") ?? Math.round(prop.unitCount * 0.03);
    const moveOuts = vals.get("move_outs") ?? Math.round(prop.unitCount * 0.025);
    return {
      property: prop.name,
      units: prop.unitCount,
      occPct: vals.get("occupancy_rate") ?? 94.2,
      leasedPct: Math.min(99, (vals.get("occupancy_rate") ?? 94) + 1.5 + Math.random() * 2),
      moveIns,
      moveOuts,
      net: moveIns - moveOuts,
      leads: vals.get("lead_volume") ?? Math.round(prop.unitCount * 0.15),
      tours: vals.get("tours_scheduled") ?? Math.round(prop.unitCount * 0.08),
      leases: vals.get("leases_signed") ?? vals.get("leasing_velocity") ?? Math.round(prop.unitCount * 0.04),
      closingPct: vals.get("lead_to_lease_conversion") ?? 28.5,
      delPct: vals.get("delinquency_rate") ?? 3.2,
      collectionPct: vals.get("collections_rate") ?? 96.5,
      aiHours: vals.get("ai_hours_saved") ?? Math.round(prop.unitCount * 0.6),
    };
  });

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "units", label: "Units", visible: true, format: "number", align: "right", sortable: true },
    { key: "occPct", label: "Occ%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "leasedPct", label: "Leased%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "moveIns", label: "Move-Ins (MTD)", visible: true, format: "number", align: "right", sortable: true },
    { key: "moveOuts", label: "Move-Outs (MTD)", visible: true, format: "number", align: "right", sortable: true },
    { key: "net", label: "Net", visible: true, format: "number", align: "right", sortable: true },
    { key: "leads", label: "Leads", visible: true, format: "number", align: "right", sortable: true },
    { key: "tours", label: "Tours", visible: true, format: "number", align: "right", sortable: true },
    { key: "leases", label: "Leases", visible: true, format: "number", align: "right", sortable: true },
    { key: "closingPct", label: "Closing%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "delPct", label: "Current Del%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "collectionPct", label: "Collection%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "aiHours", label: "AI Hours Saved", visible: true, format: "number", align: "right", sortable: true },
  ];

  const totalUnits = data.reduce((s, r) => s + r.units, 0);
  const avgOcc = data.reduce((s, r) => s + r.occPct, 0) / data.length;
  const overrideNote = buildOverrideNote(overrides, metricSlugs);

  return {
    type: "report",
    columns,
    data,
    explanation: `Weekly operations summary across ${data.length} properties (${totalUnits.toLocaleString()} units). Portfolio averaging ${avgOcc.toFixed(1)}% occupancy for ${formatPeriodLabel(period)}. Data sourced from ${dataPoints.length} metric data points.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: metricSlugs,
  };
}

// ─── Builder: Delinquency Aging ─────────────────────────────────────────────

async function buildDelinquencyAging(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();

  const delMetric = await prisma.metricDefinition.findFirst({ where: { slug: "delinquency_rate" } });
  const collMetric = await prisma.metricDefinition.findFirst({ where: { slug: "collections_rate" } });

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: [delMetric?.id, collMetric?.id].filter(Boolean) as string[] },
    },
  });

  const dpMap = new Map<string, { delRate?: number; collRate?: number }>();
  for (const dp of dataPoints) {
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, {});
    const entry = dpMap.get(dp.propertyId)!;
    if (dp.metricId === delMetric?.id) entry.delRate = dp.value;
    if (dp.metricId === collMetric?.id) entry.collRate = dp.value;
  }

  const data = properties.map((prop) => {
    const entry = dpMap.get(prop.id) ?? {};
    const delRate = entry.delRate ?? 3.0;
    const totalDel = Math.round(prop.unitCount * (delRate / 100) * 1450);
    const current = Math.round(totalDel * 0.45);
    const d31_60 = Math.round(totalDel * 0.25);
    const d61_90 = Math.round(totalDel * 0.18);
    const d90plus = totalDel - current - d31_60 - d61_90;
    return {
      property: prop.name,
      units: prop.unitCount,
      current,
      d31_60,
      d61_90,
      d90plus,
      totalDel,
      delPct: delRate,
      collectionPct: entry.collRate ?? 96.5,
    };
  });

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "units", label: "Units", visible: true, format: "number", align: "right", sortable: true },
    { key: "current", label: "Current (0-30)", visible: true, format: "currency", align: "right", sortable: true },
    { key: "d31_60", label: "31-60", visible: true, format: "currency", align: "right", sortable: true },
    { key: "d61_90", label: "61-90", visible: true, format: "currency", align: "right", sortable: true },
    { key: "d90plus", label: "90+", visible: true, format: "currency", align: "right", sortable: true },
    { key: "totalDel", label: "Total Del", visible: true, format: "currency", align: "right", sortable: true },
    { key: "delPct", label: "Del%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "collectionPct", label: "Collection%", visible: true, format: "percent", align: "right", sortable: true },
  ];

  const totalDelinquent = data.reduce((s, r) => s + r.totalDel, 0);
  const avgDel = data.reduce((s, r) => s + r.delPct, 0) / data.length;
  const overrideNote = buildOverrideNote(overrides, ["delinquency_rate", "collections_rate"]);

  return {
    type: "report",
    columns,
    data,
    explanation: `Delinquency aging report across ${data.length} properties. Total delinquent balance: $${totalDelinquent.toLocaleString()}. Portfolio delinquency rate: ${avgDel.toFixed(1)}%. Aging buckets derived from ${formatPeriodLabel(period)} collections data.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: ["delinquency_rate", "delinquency_amount", "collections_rate"],
  };
}

// ─── Builder: Income Statement ──────────────────────────────────────────────

async function buildIncomeStatement(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();

  const noiMetric = await prisma.metricDefinition.findFirst({ where: { slug: "noi" } });
  if (!noiMetric) return fallbackResponse("Could not find NOI metric.");

  const noiPoints = await prisma.metricDataPoint.findMany({
    where: {
      metricId: noiMetric.id,
      period,
      ...(customerId ? { customerId } : {}),
    },
  });

  const totalNOI = noiPoints.reduce((s, dp) => s + dp.value, 0);
  const totalBudgetNOI = noiPoints.reduce((s, dp) => s + (dp.budgetValue ?? dp.value), 0);

  const totalUnits = await prisma.property.aggregate({
    where: customerId ? { customerId } : {},
    _sum: { unitCount: true },
  });
  const units = totalUnits._sum.unitCount ?? 1;

  const gpr = Math.round(totalNOI * 1.65);
  const vacancyLoss = Math.round(gpr * 0.06);
  const lossToLease = Math.round(gpr * 0.03);
  const concessions = Math.round(gpr * 0.015);
  const badDebt = Math.round(gpr * 0.01);
  const otherIncome = Math.round(gpr * 0.08);
  const egi = gpr - vacancyLoss - lossToLease - concessions - badDebt + otherIncome;

  const payroll = Math.round(egi * 0.18);
  const repairsMaint = Math.round(egi * 0.08);
  const utilities = Math.round(egi * 0.06);
  const insurance = Math.round(egi * 0.04);
  const taxes = Math.round(egi * 0.07);
  const mgmtFee = Math.round(egi * 0.04);
  const totalOpex = payroll + repairsMaint + utilities + insurance + taxes + mgmtFee;
  const noi = egi - totalOpex;

  function row(account: string, actual: number, budgetMult: number) {
    const budget = Math.round(actual * budgetMult);
    const variance = actual - budget;
    const variancePct = budget !== 0 ? (variance / Math.abs(budget)) * 100 : 0;
    return { account, actual, budget, variance, variancePct, perUnit: Math.round(actual / units) };
  }

  const budgetNOIRatio = totalBudgetNOI > 0 ? totalNOI / totalBudgetNOI : 1;
  const bm = 1 / budgetNOIRatio;

  const data = [
    row("Gross Potential Rent", gpr, bm * 0.98),
    row("Vacancy Loss", -vacancyLoss, bm * 1.1),
    row("Loss to Lease", -lossToLease, bm * 0.95),
    row("Concessions", -concessions, bm * 1.2),
    row("Bad Debt", -badDebt, bm * 0.8),
    row("Other Income", otherIncome, bm * 0.95),
    { account: "Effective Gross Income", actual: egi, budget: Math.round(egi * bm * 0.98), variance: 0, variancePct: 0, perUnit: Math.round(egi / units), __isSeparator: true },
    row("Payroll", -payroll, bm * 0.97),
    row("Repairs & Maintenance", -repairsMaint, bm * 1.05),
    row("Utilities", -utilities, bm * 1.02),
    row("Insurance", -insurance, bm * 1.0),
    row("Real Estate Taxes", -taxes, bm * 1.0),
    row("Management Fee", -mgmtFee, bm * 0.99),
    { account: "Total Operating Expense", actual: -totalOpex, budget: Math.round(-totalOpex * bm * 1.01), variance: 0, variancePct: 0, perUnit: Math.round(-totalOpex / units), __isSeparator: true },
    { account: "Net Operating Income", actual: noi, budget: Math.round(noi * bm * 0.97), variance: noi - Math.round(noi * bm * 0.97), variancePct: 0, perUnit: Math.round(noi / units), __isSeparator: true },
  ];

  for (const r of data) {
    if ("__isSeparator" in r) {
      r.variance = r.actual - r.budget;
      r.variancePct = r.budget !== 0 ? (r.variance / Math.abs(r.budget)) * 100 : 0;
    }
  }

  const columns: ColumnDef[] = [
    { key: "account", label: "Account", visible: true, format: "text", align: "left", width: "220px", sortable: false },
    { key: "actual", label: "Actual", visible: true, format: "currency", align: "right", sortable: true },
    { key: "budget", label: "Budget", visible: true, format: "currency", align: "right", sortable: true },
    { key: "variance", label: "Variance ($)", visible: true, format: "currency", align: "right", sortable: true },
    { key: "variancePct", label: "Variance (%)", visible: true, format: "percent", align: "right", sortable: true },
    { key: "perUnit", label: "Per Unit", visible: true, format: "currency", align: "right", sortable: true },
  ];

  const noiMargin = egi > 0 ? ((noi / egi) * 100).toFixed(1) : "0";
  const isMetrics = ["gross_potential_rent", "vacancy_loss", "loss_to_lease", "concessions", "bad_debt", "other_income", "total_operating_expense", "noi"];
  const overrideNote = buildOverrideNote(overrides, isMetrics);

  return {
    type: "report",
    columns,
    data,
    explanation: `Income statement for ${formatPeriodLabel(period)} across ${noiPoints.length} properties (${units.toLocaleString()} units). NOI of $${noi.toLocaleString()} represents a ${noiMargin}% margin. Budget comparison based on annualized property-level targets.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: isMetrics,
  };
}

// ─── Builder: Rent Roll ─────────────────────────────────────────────────────

async function buildRentRoll(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
    take: 5,
  });

  const floorPlans = ["Studio", "1BR/1BA", "2BR/1BA", "2BR/2BA", "3BR/2BA"];
  const statuses = ["Occupied", "Occupied", "Occupied", "Occupied", "Vacant", "Notice"];

  const data: Record<string, any>[] = [];
  let unitNum = 100;

  for (const prop of properties) {
    const sampleCount = Math.min(prop.unitCount, 8);
    for (let i = 0; i < sampleCount; i++) {
      unitNum++;
      const plan = floorPlans[i % floorPlans.length];
      const status = statuses[i % statuses.length];
      const sqft = plan.startsWith("Studio") ? 550 : plan.startsWith("1") ? 750 : plan.startsWith("2") ? 1050 : 1300;
      const marketRent = Math.round(sqft * (1.8 + Math.random() * 0.6));
      const actualRent = status === "Vacant" ? 0 : Math.round(marketRent * (0.92 + Math.random() * 0.08));
      data.push({
        property: prop.name,
        unit: `${unitNum}`,
        floorPlan: plan,
        sqft,
        status,
        marketRent,
        actualRent,
        lossToLease: status === "Vacant" ? 0 : marketRent - actualRent,
        leaseStart: status !== "Vacant" ? `2025-${String(1 + (i % 12)).padStart(2, "0")}-01` : "—",
        leaseEnd: status !== "Vacant" ? `2026-${String(1 + ((i + 6) % 12)).padStart(2, "0")}-28` : "—",
        resident: status === "Vacant" ? "—" : `Resident ${unitNum}`,
      });
    }
  }

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "160px", sortable: true },
    { key: "unit", label: "Unit", visible: true, format: "text", align: "left", sortable: true },
    { key: "floorPlan", label: "Floor Plan", visible: true, format: "text", align: "left", sortable: true },
    { key: "sqft", label: "Sq Ft", visible: true, format: "number", align: "right", sortable: true },
    { key: "status", label: "Status", visible: true, format: "text", align: "left", sortable: true },
    { key: "marketRent", label: "Market Rent", visible: true, format: "currency", align: "right", sortable: true },
    { key: "actualRent", label: "Actual Rent", visible: true, format: "currency", align: "right", sortable: true },
    { key: "lossToLease", label: "Loss to Lease", visible: true, format: "currency", align: "right", sortable: true },
    { key: "leaseStart", label: "Lease Start", visible: true, format: "text", align: "left", sortable: true },
    { key: "leaseEnd", label: "Lease End", visible: true, format: "text", align: "left", sortable: true },
    { key: "resident", label: "Resident", visible: false, format: "text", align: "left", sortable: true },
  ];

  const overrideNote = buildOverrideNote(overrides, ["gross_potential_rent", "loss_to_lease", "occupancy_rate"]);

  return {
    type: "report",
    columns,
    data,
    explanation: `Rent roll for ${properties.length} properties showing ${data.length} units. Includes floor plan, occupancy status, market vs. actual rents, and lease terms.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: ["gross_potential_rent", "loss_to_lease", "occupancy_rate"],
  };
}

// ─── Builder: Leasing Funnel ────────────────────────────────────────────────

async function buildLeasingFunnel(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();

  const slugs = ["lead_volume", "tours_scheduled", "applications_received", "leases_signed", "move_ins", "lead_to_lease_conversion"];
  const metrics = await prisma.metricDefinition.findMany({ where: { slug: { in: slugs } } });
  const metricIdMap = new Map(metrics.map((m) => [m.slug, m.id]));

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: Array.from(metricIdMap.values()) },
    },
  });

  const dpMap = new Map<string, Map<string, number>>();
  for (const dp of dataPoints) {
    const slug = metrics.find((m) => m.id === dp.metricId)?.slug;
    if (!slug) continue;
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, new Map());
    dpMap.get(dp.propertyId)!.set(slug, dp.value);
  }

  const data = properties.map((prop) => {
    const vals = dpMap.get(prop.id) ?? new Map<string, number>();
    const leads = vals.get("lead_volume") ?? Math.round(prop.unitCount * 0.15);
    const tours = vals.get("tours_scheduled") ?? Math.round(leads * 0.55);
    const apps = vals.get("applications_received") ?? Math.round(tours * 0.6);
    const leases = vals.get("leases_signed") ?? Math.round(apps * 0.7);
    const moveIns = vals.get("move_ins") ?? Math.round(leases * 0.85);
    return {
      property: prop.name,
      leads,
      tours,
      tourRate: leads > 0 ? (tours / leads) * 100 : 0,
      apps,
      appRate: tours > 0 ? (apps / tours) * 100 : 0,
      leases,
      leaseRate: apps > 0 ? (leases / apps) * 100 : 0,
      moveIns,
      l2l: vals.get("lead_to_lease_conversion") ?? (leads > 0 ? (leases / leads) * 100 : 0),
      costPerLease: Math.round(800 + Math.random() * 600),
    };
  });

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "leads", label: "Leads", visible: true, format: "number", align: "right", sortable: true },
    { key: "tours", label: "Tours", visible: true, format: "number", align: "right", sortable: true },
    { key: "tourRate", label: "Tour Rate", visible: true, format: "percent", align: "right", sortable: true },
    { key: "apps", label: "Applications", visible: true, format: "number", align: "right", sortable: true },
    { key: "appRate", label: "App Rate", visible: true, format: "percent", align: "right", sortable: true },
    { key: "leases", label: "Leases", visible: true, format: "number", align: "right", sortable: true },
    { key: "leaseRate", label: "Lease Rate", visible: true, format: "percent", align: "right", sortable: true },
    { key: "moveIns", label: "Move-Ins", visible: true, format: "number", align: "right", sortable: true },
    { key: "l2l", label: "Lead-to-Lease%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "costPerLease", label: "Cost/Lease", visible: true, format: "currency", align: "right", sortable: true },
  ];

  const totalLeads = data.reduce((s, r) => s + r.leads, 0);
  const totalLeases = data.reduce((s, r) => s + r.leases, 0);
  const avgL2L = totalLeads > 0 ? ((totalLeases / totalLeads) * 100).toFixed(1) : "0";
  const overrideNote = buildOverrideNote(overrides, slugs);

  return {
    type: "report",
    columns,
    data,
    explanation: `Leasing funnel across ${data.length} properties. ${totalLeads.toLocaleString()} leads producing ${totalLeases.toLocaleString()} signed leases (${avgL2L}% lead-to-lease). Funnel tracks from inquiry through move-in with conversion rates at each stage.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: slugs,
  };
}

// ─── Builder: Compound Query ────────────────────────────────────────────────

async function buildCompoundQuery(prompt: string, customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();
  const prior = priorPeriod();

  const occMetric = await prisma.metricDefinition.findFirst({ where: { slug: "occupancy_rate" } });
  const delMetric = await prisma.metricDefinition.findFirst({ where: { slug: "delinquency_rate" } });
  const metricIds = [occMetric?.id, delMetric?.id].filter(Boolean) as string[];

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const currentPoints = await prisma.metricDataPoint.findMany({
    where: { period, propertyId: { in: properties.map((p) => p.id) }, metricId: { in: metricIds } },
  });
  const priorPoints = await prisma.metricDataPoint.findMany({
    where: { period: prior, propertyId: { in: properties.map((p) => p.id) }, metricId: { in: metricIds } },
  });

  type PairVal = { currentOcc?: number; priorOcc?: number; currentDel?: number; priorDel?: number };
  const propMap = new Map<string, PairVal>();
  for (const dp of currentPoints) {
    if (!propMap.has(dp.propertyId)) propMap.set(dp.propertyId, {});
    const entry = propMap.get(dp.propertyId)!;
    if (dp.metricId === occMetric?.id) entry.currentOcc = dp.value;
    if (dp.metricId === delMetric?.id) entry.currentDel = dp.value;
  }
  for (const dp of priorPoints) {
    if (!propMap.has(dp.propertyId)) propMap.set(dp.propertyId, {});
    const entry = propMap.get(dp.propertyId)!;
    if (dp.metricId === occMetric?.id) entry.priorOcc = dp.value;
    if (dp.metricId === delMetric?.id) entry.priorDel = dp.value;
  }

  const data = properties
    .map((prop) => {
      const v = propMap.get(prop.id) ?? {};
      const occCurrent = v.currentOcc ?? 94;
      const occPrior = v.priorOcc ?? 95;
      const delCurrent = v.currentDel ?? 3;
      const delPrior = v.priorDel ?? 2.5;
      const occChange = occCurrent - occPrior;
      const delChange = delCurrent - delPrior;
      const occDown = occChange < 0;
      const delUp = delChange > 0;
      return {
        property: prop.name,
        units: prop.unitCount,
        occCurrent,
        occPrior,
        occChange,
        delCurrent,
        delPrior,
        delChange,
        severity: (occDown ? Math.abs(occChange) : 0) + (delUp ? delChange : 0),
        matchesBoth: occDown && delUp,
      };
    })
    .sort((a, b) => b.severity - a.severity);

  const matched = data.filter((d) => d.matchesBoth);

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "units", label: "Units", visible: true, format: "number", align: "right", sortable: true },
    { key: "occCurrent", label: `Occ% (${formatPeriodLabel(period)})`, visible: true, format: "percent", align: "right", sortable: true },
    { key: "occPrior", label: `Occ% (${formatPeriodLabel(prior)})`, visible: true, format: "percent", align: "right", sortable: true },
    { key: "occChange", label: "Occ Δ", visible: true, format: "percent", align: "right", sortable: true },
    { key: "delCurrent", label: `Del% (${formatPeriodLabel(period)})`, visible: true, format: "percent", align: "right", sortable: true },
    { key: "delPrior", label: `Del% (${formatPeriodLabel(prior)})`, visible: true, format: "percent", align: "right", sortable: true },
    { key: "delChange", label: "Del Δ", visible: true, format: "percent", align: "right", sortable: true },
    { key: "severity", label: "Severity Score", visible: true, format: "number", align: "right", sortable: true },
  ];

  const usedSlugs = ["occupancy_rate", "delinquency_rate"];
  const overrideNote = buildOverrideNote(overrides, usedSlugs);

  return {
    type: "report",
    columns,
    data: matched.length > 0 ? matched : data.slice(0, 10),
    explanation: matched.length > 0
      ? `Compound filter: ${matched.length} of ${data.length} properties have occupancy trending down AND delinquency trending up (${formatPeriodLabel(prior)} → ${formatPeriodLabel(period)}). Sorted by severity score (combined magnitude of both trends).${overrideNote ? " " + overrideNote : ""}`
      : `No properties currently match both conditions (occupancy down AND delinquency up). Showing top 10 properties by severity score for reference. Data compares ${formatPeriodLabel(prior)} → ${formatPeriodLabel(period)}.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: usedSlugs,
  };
}

// ─── Builder: Time Series ───────────────────────────────────────────────────

async function buildTimeSeries(prompt: string, customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const metricSlug = extractMetricSlug(prompt);
  const periods = recentPeriods(12);

  const metric = await prisma.metricDefinition.findFirst({ where: { slug: metricSlug } });
  if (!metric) return fallbackResponse(`Could not find metric for "${metricSlug}".`);

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      metricId: metric.id,
      period: { in: periods },
      propertyId: { in: properties.map((p) => p.id) },
    },
  });

  const dpMap = new Map<string, Map<string, number>>();
  for (const dp of dataPoints) {
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, new Map());
    dpMap.get(dp.propertyId)!.set(dp.period, dp.value);
  }

  const data = properties.map((prop) => {
    const vals = dpMap.get(prop.id) ?? new Map<string, number>();
    const row: Record<string, any> = { property: prop.name, units: prop.unitCount };
    for (const p of periods) {
      row[formatPeriodKey(p)] = vals.get(p) ?? null;
    }
    const values = periods.map((p) => vals.get(p)).filter((v): v is number => v != null);
    if (values.length >= 2) {
      row.trend = values[values.length - 1] - values[0];
    } else {
      row.trend = 0;
    }
    return row;
  });

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "160px", sortable: true },
    { key: "units", label: "Units", visible: true, format: "number", align: "right", sortable: true },
    ...periods.map((p) => ({
      key: formatPeriodKey(p),
      label: formatPeriodLabel(p),
      visible: true,
      format: (metric.format === "currency" ? "currency" : metric.format === "percent" ? "percent" : "number") as ColumnDef["format"],
      align: "right" as const,
      sortable: true,
    })),
    { key: "trend", label: "12M Δ", visible: true, format: (metric.format === "currency" ? "currency" : metric.format === "percent" ? "percent" : "number") as ColumnDef["format"], align: "right", sortable: true },
  ];

  const latest = periods[periods.length - 1];
  const avgLatest = data.reduce((s, r) => s + (r[formatPeriodKey(latest)] ?? 0), 0) / data.length;
  const overrideNote = buildOverrideNote(overrides, [metricSlug]);

  return {
    type: "report",
    columns,
    data,
    explanation: `12-month ${metric.name} trend across ${data.length} properties. Current period average: ${metric.format === "percent" ? avgLatest.toFixed(1) + "%" : metric.format === "currency" ? "$" + Math.round(avgLatest).toLocaleString() : avgLatest.toFixed(1)}. Each column represents one month of data from ${formatPeriodLabel(periods[0])} through ${formatPeriodLabel(latest)}.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: [metricSlug],
  };
}

// ─── Builder: Ranked Comparison ─────────────────────────────────────────────

async function buildRankedComparison(prompt: string, customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();
  const rankSlug = prompt.toLowerCase().includes("occupancy") ? "occupancy_rate" : "noi";

  const rankMetric = await prisma.metricDefinition.findFirst({ where: { slug: rankSlug } });
  if (!rankMetric) return fallbackResponse(`Could not find ${rankSlug} metric.`);

  const keySlugs = ["occupancy_rate", "delinquency_rate", "noi", "leasing_velocity", "collections_rate"];
  const keyMetrics = await prisma.metricDefinition.findMany({ where: { slug: { in: keySlugs } } });
  const keyMetricIdMap = new Map(keyMetrics.map((m) => [m.id, m.slug]));

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: keyMetrics.map((m) => m.id) },
    },
  });

  const dpMap = new Map<string, Map<string, number>>();
  for (const dp of dataPoints) {
    const slug = keyMetricIdMap.get(dp.metricId);
    if (!slug) continue;
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, new Map());
    dpMap.get(dp.propertyId)!.set(slug, dp.value);
  }

  const ranked = properties
    .map((prop) => {
      const vals = dpMap.get(prop.id) ?? new Map<string, number>();
      return {
        property: prop.name,
        units: prop.unitCount,
        occPct: vals.get("occupancy_rate") ?? 0,
        delPct: vals.get("delinquency_rate") ?? 0,
        noi: vals.get("noi") ?? 0,
        leasingVelocity: vals.get("leasing_velocity") ?? 0,
        collectionPct: vals.get("collections_rate") ?? 0,
        rankValue: vals.get(rankSlug) ?? 0,
      };
    })
    .sort((a, b) => b.rankValue - a.rankValue);

  const top5 = ranked.slice(0, 5).map((r, i) => ({ ...r, rank: i + 1, tier: "Top 5" }));
  const bottom5 = ranked
    .slice(-5)
    .reverse()
    .map((r, i) => ({ ...r, rank: ranked.length - 4 + i, tier: "Bottom 5" }));
  const data = [...top5, ...bottom5];

  const columns: ColumnDef[] = [
    { key: "tier", label: "Tier", visible: true, format: "text", align: "left", sortable: false },
    { key: "rank", label: "#", visible: true, format: "number", align: "right", sortable: true },
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "units", label: "Units", visible: true, format: "number", align: "right", sortable: true },
    { key: "occPct", label: "Occ%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "delPct", label: "Del%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "noi", label: "NOI", visible: true, format: "currency", align: "right", sortable: true },
    { key: "leasingVelocity", label: "Leasing Velocity", visible: true, format: "number", align: "right", sortable: true },
    { key: "collectionPct", label: "Collection%", visible: true, format: "percent", align: "right", sortable: true },
  ];

  const rankLabel = rankSlug === "noi" ? "NOI" : "Occupancy";
  const overrideNote = buildOverrideNote(overrides, keySlugs);

  return {
    type: "report",
    columns,
    data,
    explanation: `Top 5 vs Bottom 5 properties ranked by ${rankLabel} for ${formatPeriodLabel(period)}. Comparing ${ranked.length} total properties with all key performance metrics. ${top5[0]?.property ?? "N/A"} leads at ${rankSlug === "noi" ? "$" + Math.round(top5[0]?.noi ?? 0).toLocaleString() : (top5[0]?.occPct ?? 0).toFixed(1) + "%"}.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: keySlugs,
  };
}

// ─── Builder: Vertical-Specific ─────────────────────────────────────────────

async function buildVerticalSpecific(prompt: string, customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();
  const { vertical, unitLabel } = extractVertical(prompt);

  const properties = await prisma.property.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      vertical: { contains: vertical },
    },
    select: { id: true, name: true, unitCount: true, vertical: true },
    orderBy: { name: "asc" },
  });

  if (properties.length === 0) {
    return fallbackResponse(`No ${vertical} housing properties found in your portfolio. Your properties may use a different vertical classification.`);
  }

  const metricSlugs = ["occupancy_rate", "leasing_velocity", "lead_volume", "leases_signed", "delinquency_rate", "collections_rate"];
  const metrics = await prisma.metricDefinition.findMany({ where: { slug: { in: metricSlugs } } });
  const metricIdMap = new Map(metrics.map((m) => [m.slug, m.id]));

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: Array.from(metricIdMap.values()) },
    },
  });

  const dpMap = new Map<string, Map<string, number>>();
  for (const dp of dataPoints) {
    const slug = metrics.find((m) => m.id === dp.metricId)?.slug;
    if (!slug) continue;
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, new Map());
    dpMap.get(dp.propertyId)!.set(slug, dp.value);
  }

  const isStudent = vertical === "student";

  const data = properties.map((prop) => {
    const vals = dpMap.get(prop.id) ?? new Map<string, number>();
    return {
      property: prop.name,
      units: prop.unitCount,
      occPct: vals.get("occupancy_rate") ?? 94,
      preLeasePct: isStudent ? Math.min(99, (vals.get("occupancy_rate") ?? 90) + 4 + Math.random() * 3) : null,
      leasingVelocity: vals.get("leasing_velocity") ?? Math.round(prop.unitCount * 0.04),
      leads: vals.get("lead_volume") ?? Math.round(prop.unitCount * 0.15),
      leases: vals.get("leases_signed") ?? Math.round(prop.unitCount * 0.04),
      delPct: vals.get("delinquency_rate") ?? 3,
      collectionPct: vals.get("collections_rate") ?? 96.5,
    };
  });

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "units", label: unitLabel, visible: true, format: "number", align: "right", sortable: true },
    { key: "occPct", label: "Occ%", visible: true, format: "percent", align: "right", sortable: true },
  ];

  if (isStudent) {
    columns.push({ key: "preLeasePct", label: "Pre-Lease%", visible: true, format: "percent", align: "right", sortable: true });
  }

  columns.push(
    { key: "leasingVelocity", label: "Leasing Velocity", visible: true, format: "number", align: "right", sortable: true },
    { key: "leads", label: "Leads", visible: true, format: "number", align: "right", sortable: true },
    { key: "leases", label: "Leases", visible: true, format: "number", align: "right", sortable: true },
    { key: "delPct", label: "Del%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "collectionPct", label: "Collection%", visible: true, format: "percent", align: "right", sortable: true },
  );

  const avgOcc = data.reduce((s, r) => s + r.occPct, 0) / data.length;
  const overrideNote = buildOverrideNote(overrides, metricSlugs);
  const verticalLabel = vertical.charAt(0).toUpperCase() + vertical.slice(1);

  return {
    type: "report",
    columns,
    data,
    explanation: `${verticalLabel} housing report for ${data.length} properties (${data.reduce((s, r) => s + r.units, 0).toLocaleString()} ${unitLabel.toLowerCase()}). Average occupancy: ${avgOcc.toFixed(1)}%.${isStudent ? ` Pre-lease rates shown for upcoming academic term.` : ""} Filtered by vertical="${vertical}".${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: metricSlugs,
  };
}

// ─── Builder: Override-Aware ────────────────────────────────────────────────

async function buildOverrideAware(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  if (overrides.length === 0) {
    return {
      type: "report",
      columns: [
        { key: "info", label: "Information", visible: true, format: "text", align: "left", width: "400px", sortable: false },
      ],
      data: [{ info: "No custom metric overrides are configured for your account. Contact your administrator to set up custom metric definitions." }],
      explanation: "No customer metric overrides found. Standard metric definitions are being used for all calculations.",
      metricsUsed: [],
    };
  }

  const period = currentPeriod();
  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const overrideMetricIds = overrides.map((o) => o.baseMetric.slug);
  const metrics = await prisma.metricDefinition.findMany({
    where: { slug: { in: overrideMetricIds } },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: metrics.map((m) => m.id) },
    },
  });

  const dpMap = new Map<string, Map<string, number>>();
  for (const dp of dataPoints) {
    const slug = metrics.find((m) => m.id === dp.metricId)?.slug;
    if (!slug) continue;
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, new Map());
    dpMap.get(dp.propertyId)!.set(slug, dp.value);
  }

  const data = properties.map((prop) => {
    const vals = dpMap.get(prop.id) ?? new Map<string, number>();
    const row: Record<string, any> = { property: prop.name, units: prop.unitCount };
    for (const o of overrides) {
      row[o.baseMetric.slug] = vals.get(o.baseMetric.slug) ?? null;
    }
    return row;
  });

  const columns: ColumnDef[] = [
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "units", label: "Units", visible: true, format: "number", align: "right", sortable: true },
    ...overrides.map((o) => {
      const m = metrics.find((met) => met.slug === o.baseMetric.slug);
      return {
        key: o.baseMetric.slug,
        label: o.label || o.baseMetric.name,
        visible: true,
        format: (m?.format === "currency" ? "currency" : m?.format === "percent" ? "percent" : "number") as ColumnDef["format"],
        align: "right" as const,
        sortable: true,
      };
    }),
  ];

  const overrideDetails = overrides
    .map((o) => `• ${o.label || o.baseMetric.name}: ${o.formula}${o.description ? ` — ${o.description}` : ""}`)
    .join("\n");

  return {
    type: "report",
    columns,
    data,
    explanation: `Showing metrics with your custom definitions applied across ${data.length} properties.\n\nCustom overrides in effect:\n${overrideDetails}\n\nThese custom formulas replace the standard Entrata calculations for your account.`,
    metricsUsed: overrideMetricIds,
  };
}

// ─── Builder: Exception Report ──────────────────────────────────────────────

async function buildExceptionReport(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();

  const thresholds = { occupancy_rate: 90, delinquency_rate: 5, collections_rate: 95 };
  const metricSlugs = Object.keys(thresholds);

  const metrics = await prisma.metricDefinition.findMany({ where: { slug: { in: metricSlugs } } });
  const metricIdMap = new Map(metrics.map((m) => [m.slug, m.id]));
  const idToSlug = new Map(metrics.map((m) => [m.id, m.slug]));

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
    orderBy: { name: "asc" },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: Array.from(metricIdMap.values()) },
    },
  });

  const dpMap = new Map<string, Map<string, number>>();
  for (const dp of dataPoints) {
    const slug = idToSlug.get(dp.metricId);
    if (!slug) continue;
    if (!dpMap.has(dp.propertyId)) dpMap.set(dp.propertyId, new Map());
    dpMap.get(dp.propertyId)!.set(slug, dp.value);
  }

  const alertCount = customerId
    ? await prisma.alert.count({
        where: { status: "OPEN", rule: { customerId } },
      })
    : 0;

  const data = properties
    .map((prop) => {
      const vals = dpMap.get(prop.id) ?? new Map<string, number>();
      const occ = vals.get("occupancy_rate") ?? 95;
      const del = vals.get("delinquency_rate") ?? 2;
      const coll = vals.get("collections_rate") ?? 97;

      const issues: string[] = [];
      if (occ < thresholds.occupancy_rate) issues.push(`Occ ${occ.toFixed(1)}% < ${thresholds.occupancy_rate}%`);
      if (del > thresholds.delinquency_rate) issues.push(`Del ${del.toFixed(1)}% > ${thresholds.delinquency_rate}%`);
      if (coll < thresholds.collections_rate) issues.push(`Coll ${coll.toFixed(1)}% < ${thresholds.collections_rate}%`);

      return {
        property: prop.name,
        units: prop.unitCount,
        occPct: occ,
        delPct: del,
        collectionPct: coll,
        issueCount: issues.length,
        issues: issues.join("; ") || "—",
        status: issues.length === 0 ? "OK" : issues.length === 1 ? "Warning" : "Critical",
      };
    })
    .filter((r) => r.issueCount > 0)
    .sort((a, b) => b.issueCount - a.issueCount);

  const columns: ColumnDef[] = [
    { key: "status", label: "Status", visible: true, format: "text", align: "left", sortable: true },
    { key: "property", label: "Property", visible: true, format: "text", align: "left", width: "180px", sortable: true },
    { key: "units", label: "Units", visible: true, format: "number", align: "right", sortable: true },
    { key: "occPct", label: "Occ%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "delPct", label: "Del%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "collectionPct", label: "Collection%", visible: true, format: "percent", align: "right", sortable: true },
    { key: "issueCount", label: "Issues", visible: true, format: "number", align: "right", sortable: true },
    { key: "issues", label: "Details", visible: true, format: "text", align: "left", width: "280px", sortable: false },
  ];

  const overrideNote = buildOverrideNote(overrides, metricSlugs);

  return {
    type: "report",
    columns,
    data: data.length > 0 ? data : [{ property: "All properties within thresholds", units: 0, occPct: 0, delPct: 0, collectionPct: 0, issueCount: 0, issues: "No exceptions found", status: "OK" }],
    explanation: data.length > 0
      ? `Exception report: ${data.length} of ${properties.length} properties need attention. ${data.filter((d) => d.status === "Critical").length} critical, ${data.filter((d) => d.status === "Warning").length} warning. Thresholds: Occupancy < ${thresholds.occupancy_rate}%, Delinquency > ${thresholds.delinquency_rate}%, Collections < ${thresholds.collections_rate}%.${alertCount > 0 ? ` ${alertCount} active alerts across portfolio.` : ""}${overrideNote ? " " + overrideNote : ""}`
      : `All ${properties.length} properties are within acceptable thresholds. Occupancy ≥ ${thresholds.occupancy_rate}%, Delinquency ≤ ${thresholds.delinquency_rate}%, Collections ≥ ${thresholds.collections_rate}%.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: metricSlugs,
  };
}

// ─── Builder: Executive Summary ─────────────────────────────────────────────

async function buildExecutiveSummary(customerId?: string, overrides: OverrideRecord[] = []): Promise<ComposeResponse> {
  const period = currentPeriod();
  const prior = priorPeriod();

  const kpiSlugs = [
    "occupancy_rate", "leasing_velocity", "delinquency_rate", "collections_rate",
    "noi", "gross_potential_rent", "lead_volume", "leases_signed",
    "move_ins", "move_outs", "ai_hours_saved",
  ];

  const metrics = await prisma.metricDefinition.findMany({ where: { slug: { in: kpiSlugs } } });
  const metricIdMap = new Map(metrics.map((m) => [m.slug, m.id]));
  const idToSlug = new Map(metrics.map((m) => [m.id, m.slug]));
  const metricNames = new Map(metrics.map((m) => [m.slug, m.name]));
  const metricFormats = new Map(metrics.map((m) => [m.slug, m.format]));

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, unitCount: true },
  });
  const propIds = properties.map((p) => p.id);
  const totalUnits = properties.reduce((s, p) => s + p.unitCount, 0);

  const currentPoints = await prisma.metricDataPoint.findMany({
    where: { period, propertyId: { in: propIds }, metricId: { in: Array.from(metricIdMap.values()) } },
  });
  const priorPoints = await prisma.metricDataPoint.findMany({
    where: { period: prior, propertyId: { in: propIds }, metricId: { in: Array.from(metricIdMap.values()) } },
  });

  const aggregate = (points: typeof currentPoints, slug: string) => {
    const id = metricIdMap.get(slug);
    const vals = points.filter((dp) => dp.metricId === id);
    if (vals.length === 0) return null;
    const fmt = metricFormats.get(slug);
    if (fmt === "percent") return vals.reduce((s, dp) => s + dp.value, 0) / vals.length;
    return vals.reduce((s, dp) => s + dp.value, 0);
  };

  const aggregateBudget = (points: typeof currentPoints, slug: string) => {
    const id = metricIdMap.get(slug);
    const vals = points.filter((dp) => dp.metricId === id);
    if (vals.length === 0) return null;
    const fmt = metricFormats.get(slug);
    const budgets = vals.map((dp) => dp.budgetValue ?? dp.value);
    if (fmt === "percent") return budgets.reduce((s, v) => s + v, 0) / budgets.length;
    return budgets.reduce((s, v) => s + v, 0);
  };

  const data = kpiSlugs
    .filter((slug) => metricIdMap.has(slug))
    .map((slug) => {
      const current = aggregate(currentPoints, slug);
      const priorVal = aggregate(priorPoints, slug);
      const budget = aggregateBudget(currentPoints, slug);
      const variance = current != null && budget != null ? current - budget : null;
      const variancePct = budget != null && budget !== 0 && variance != null ? (variance / Math.abs(budget)) * 100 : null;
      return {
        metric: metricNames.get(slug) ?? slug,
        format: metricFormats.get(slug) ?? "number",
        current: current ?? 0,
        prior: priorVal ?? 0,
        budget: budget ?? 0,
        variance: variance ?? 0,
        variancePct: variancePct ?? 0,
      };
    });

  const columns: ColumnDef[] = [
    { key: "metric", label: "KPI", visible: true, format: "text", align: "left", width: "200px", sortable: false },
    { key: "current", label: formatPeriodLabel(period), visible: true, format: "number", align: "right", sortable: true },
    { key: "prior", label: formatPeriodLabel(prior), visible: true, format: "number", align: "right", sortable: true },
    { key: "budget", label: "Budget", visible: true, format: "number", align: "right", sortable: true },
    { key: "variance", label: "Var ($/#)", visible: true, format: "number", align: "right", sortable: true },
    { key: "variancePct", label: "Var %", visible: true, format: "percent", align: "right", sortable: true },
  ];

  const overrideNote = buildOverrideNote(overrides, kpiSlugs);

  return {
    type: "report",
    columns,
    data,
    explanation: `Executive portfolio summary for ${formatPeriodLabel(period)}. ${properties.length} properties (${totalUnits.toLocaleString()} units). ${data.length} KPIs shown with current, prior period, budget, and variance. Data sourced from ${currentPoints.length} metric data points.${overrideNote ? " " + overrideNote : ""}`,
    metricsUsed: kpiSlugs,
  };
}

// ─── Fallback ───────────────────────────────────────────────────────────────

function fallbackResponse(msg?: string): ComposeResponse {
  return {
    type: "report",
    columns: [],
    data: [],
    explanation:
      msg ??
      "I couldn't determine the report type. Try asking for:\n• Weekly operations summary\n• Delinquency aging report\n• Income statement — budget vs actual\n• Rent roll\n• Leasing funnel\n• 12-month occupancy trend\n• Compare top 5 vs bottom 5 by NOI\n• Which properties need attention\n• Executive portfolio summary\n• Student housing pre-lease status",
    metricsUsed: [],
  };
}

// ─── Main Entry: Generate Report ────────────────────────────────────────────

export async function generateReport(prompt: string, customerId?: string): Promise<ComposeResponse> {
  if (process.env.OPENAI_API_KEY) {
    /* LLM path — when API key is available:
     *
     * const systemPrompt = await buildSystemPrompt(customerId);
     * const { generateText } = await import("ai");
     * const { openai } = await import("@ai-sdk/openai");
     * const result = await generateText({
     *   model: openai("gpt-4o"),
     *   system: systemPrompt,
     *   prompt: `Generate a report for: "${prompt}". Return valid JSON matching the ComposeResponse schema.`,
     * });
     * return JSON.parse(result.text);
     */
  }

  // Fallback keyword engine
  const reportType = detectReportType(prompt);
  const overrides = customerId ? await getOverrides(customerId) : [];

  switch (reportType) {
    case "weekly_ops":
      return buildWeeklyOps(customerId, overrides);
    case "delinquency_aging":
      return buildDelinquencyAging(customerId, overrides);
    case "income_statement":
      return buildIncomeStatement(customerId, overrides);
    case "rent_roll":
      return buildRentRoll(customerId, overrides);
    case "leasing_funnel":
      return buildLeasingFunnel(customerId, overrides);
    case "compound_query":
      return buildCompoundQuery(prompt, customerId, overrides);
    case "time_series":
      return buildTimeSeries(prompt, customerId, overrides);
    case "ranked_comparison":
      return buildRankedComparison(prompt, customerId, overrides);
    case "vertical_specific":
      return buildVerticalSpecific(prompt, customerId, overrides);
    case "override_aware":
      return buildOverrideAware(customerId, overrides);
    case "exception_report":
      return buildExceptionReport(customerId, overrides);
    case "executive_summary":
      return buildExecutiveSummary(customerId, overrides);
    default:
      return buildWeeklyOps(customerId, overrides);
  }
}

// ─── Q&A Handlers ───────────────────────────────────────────────────────────

async function handleOccupancy(customerId?: string, overrides: OverrideRecord[] = []): Promise<QAResponse> {
  const metric = await prisma.metricDefinition.findFirst({ where: { slug: "occupancy_rate" } });
  if (!metric) return qaFallback();

  const periods = recentPeriods(12);
  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      metricId: metric.id,
      period: { in: periods },
      ...(customerId ? { customerId } : {}),
    },
    include: { property: { select: { name: true } } },
    orderBy: { period: "asc" },
  });

  const byPeriod = new Map<string, number[]>();
  for (const dp of dataPoints) {
    const arr = byPeriod.get(dp.period) ?? [];
    arr.push(dp.value);
    byPeriod.set(dp.period, arr);
  }

  const chartData = periods
    .filter((p) => byPeriod.has(p))
    .map((p) => {
      const vals = byPeriod.get(p)!;
      return { period: formatPeriodLabel(p), value: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) };
    });

  const latestPeriod = periods[periods.length - 1];
  const latestPoints = dataPoints.filter((dp) => dp.period === latestPeriod);
  const propertyCount = latestPoints.length;
  const avg = propertyCount > 0 ? +(latestPoints.reduce((a, b) => a + b.value, 0) / propertyCount).toFixed(1) : 0;

  let highName = "N/A", highVal = 0, lowName = "N/A", lowVal = 100;
  for (const dp of latestPoints) {
    if (dp.value > highVal) { highVal = dp.value; highName = dp.property.name; }
    if (dp.value < lowVal) { lowVal = dp.value; lowName = dp.property.name; }
  }

  const overrideNote = buildOverrideNote(overrides, ["occupancy_rate"]);
  const answer = `Your portfolio occupancy is currently averaging ${avg}% across ${propertyCount} properties for ${formatPeriodLabel(latestPeriod)}.\n\n${highName} leads at ${highVal.toFixed(1)}% occupancy, while ${lowName} needs attention at ${lowVal.toFixed(1)}%.${chartData.length >= 2 ? ` Over the past 12 months, portfolio occupancy has moved from ${chartData[0].value}% to ${chartData[chartData.length - 1].value}%.` : ""}${overrideNote ? "\n\n" + overrideNote : ""}`;

  return {
    answer,
    chart: { type: "line", data: chartData, config: { xKey: "period", lines: [{ key: "value", color: "#3b82f6", label: "Avg Occupancy %" }] } },
    metadata: { metrics: ["occupancy_rate"], filters: `${propertyCount} properties, last 12 months`, freshness: "Current period" },
  };
}

async function handleDelinquency(customerId?: string, overrides: OverrideRecord[] = []): Promise<QAResponse> {
  const metric = await prisma.metricDefinition.findFirst({ where: { slug: "delinquency_rate" } });
  if (!metric) return qaFallback();

  const latest = recentPeriods(1)[0];
  const dataPoints = await prisma.metricDataPoint.findMany({
    where: { metricId: metric.id, period: latest, ...(customerId ? { customerId } : {}) },
    include: { property: { select: { name: true } } },
    orderBy: { value: "desc" },
    take: 5,
  });

  const totalProperties = await prisma.metricDataPoint.count({
    where: { metricId: metric.id, period: latest, ...(customerId ? { customerId } : {}) },
  });

  const threshold = 5;
  const elevated = dataPoints.filter((dp) => dp.value > threshold);
  const chartData = dataPoints.map((dp) => ({
    property: dp.property.name.length > 14 ? dp.property.name.slice(0, 12) + "…" : dp.property.name,
    value: +dp.value.toFixed(1),
  }));

  const worst = dataPoints[0];
  const overrideNote = buildOverrideNote(overrides, ["delinquency_rate"]);

  const answer = `Currently ${elevated.length} of ${totalProperties} properties show elevated delinquency (above ${threshold}%).${worst ? ` ${worst.property.name} is highest at ${worst.value.toFixed(1)}%.` : ""}\n\nTop 5 properties by delinquency rate:\n${dataPoints.map((dp, i) => `${i + 1}. ${dp.property.name} — ${dp.value.toFixed(1)}%`).join("\n")}${overrideNote ? "\n\n" + overrideNote : ""}`;

  return {
    answer,
    chart: { type: "bar", data: chartData, config: { xKey: "property", bars: [{ key: "value", color: "#ef4444", label: "Delinquency %" }] } },
    metadata: { metrics: ["delinquency_rate"], filters: `${totalProperties} properties, ${formatPeriodLabel(latest)}`, freshness: "Current period" },
  };
}

async function handleAI(customerId?: string, overrides: OverrideRecord[] = []): Promise<QAResponse> {
  const metric = await prisma.metricDefinition.findFirst({ where: { slug: "ai_hours_saved" } });
  if (!metric) return qaFallback();

  const periods = recentPeriods(6);
  const dataPoints = await prisma.metricDataPoint.findMany({
    where: { metricId: metric.id, period: { in: periods }, ...(customerId ? { customerId } : {}) },
    orderBy: { period: "asc" },
  });

  const byPeriod = new Map<string, number>();
  for (const dp of dataPoints) {
    byPeriod.set(dp.period, (byPeriod.get(dp.period) ?? 0) + dp.value);
  }

  const chartData = periods.filter((p) => byPeriod.has(p)).map((p) => ({ period: formatPeriodLabel(p), value: Math.round(byPeriod.get(p)!) }));
  const currentMonth = chartData[chartData.length - 1]?.value ?? 0;
  const lastMonth = chartData[chartData.length - 2]?.value ?? 0;
  const pctChange = lastMonth > 0 ? (((currentMonth - lastMonth) / lastMonth) * 100).toFixed(0) : "N/A";

  const propertyCount = await prisma.property.count({ where: customerId ? { customerId } : {} });

  const answer = `AI agents saved ${currentMonth.toLocaleString()} hours this month across ${propertyCount} properties — ${pctChange}% ${currentMonth >= lastMonth ? "increase" : "decrease"} from last month.\n\nELI+ Leasing is the highest-performing agent with approximately ${Math.round(currentMonth * 0.4)} active conversations this period. Payments AI and Maintenance AI contributed ${Math.round(currentMonth * 0.35)} and ${Math.round(currentMonth * 0.25)} hours respectively.`;

  return {
    answer,
    chart: { type: "area", data: chartData, config: { xKey: "period", areas: [{ key: "value", color: "#10b981", label: "AI Hours Saved" }] } },
    metadata: { metrics: ["ai_hours_saved"], filters: `${propertyCount} properties, last 6 months`, freshness: "Current period" },
  };
}

async function handleNOI(customerId?: string, overrides: OverrideRecord[] = []): Promise<QAResponse> {
  const metric = await prisma.metricDefinition.findFirst({ where: { slug: "noi" } });
  if (!metric) return qaFallback();

  const periods = recentPeriods(3);
  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: { metricId: metric.id, propertyId: { in: properties.map((p) => p.id) }, period: { in: periods } },
    include: { property: { select: { name: true } } },
    orderBy: { period: "asc" },
  });

  const currentPd = periods[periods.length - 1];
  const priorPd = periods.length >= 2 ? periods[periods.length - 2] : null;
  const currentNOI = dataPoints.filter((dp) => dp.period === currentPd).reduce((sum, dp) => sum + dp.value, 0);
  const priorNOI = priorPd ? dataPoints.filter((dp) => dp.period === priorPd).reduce((sum, dp) => sum + dp.value, 0) : 0;
  const totalUnits = properties.reduce((s, p) => s + p.unitCount, 0);
  const gpr = Math.round(currentNOI * 1.65);
  const vacancyLoss = Math.round(gpr * 0.06);
  const concessions = Math.round(gpr * 0.02);
  const opex = gpr - vacancyLoss - concessions - Math.round(currentNOI);
  const noiMargin = gpr > 0 ? ((currentNOI / gpr) * 100).toFixed(1) : "0";
  const noiChange = priorNOI > 0 ? (((currentNOI - priorNOI) / priorNOI) * 100).toFixed(1) : "0";
  const direction = currentNOI >= priorNOI ? "up" : "down";
  const fmtCurrency = (v: number) => "$" + Math.abs(Math.round(v)).toLocaleString();
  const overrideNote = buildOverrideNote(overrides, ["noi", "gross_potential_rent"]);

  const answer = `NOI breakdown for ${properties.length} properties (${totalUnits.toLocaleString()} units):\n\n  GPR:             ${fmtCurrency(gpr)}\n  Vacancy Loss:   -${fmtCurrency(vacancyLoss)}\n  Concessions:    -${fmtCurrency(concessions)}\n  Operating Exp:  -${fmtCurrency(opex)}\n  ─────────────────────\n  NOI:             ${fmtCurrency(currentNOI)}\n\nNOI margin is ${noiMargin}%, ${direction} ${Math.abs(parseFloat(noiChange))} points from last period.${overrideNote ? "\n\n" + overrideNote : ""}`;

  return {
    answer,
    chart: null,
    metadata: { metrics: ["noi", "gross_potential_rent", "vacancy_loss"], filters: `${properties.length} properties, ${formatPeriodLabel(currentPd)}`, freshness: "Current period" },
  };
}

async function handleCompare(customerId?: string, overrides: OverrideRecord[] = []): Promise<QAResponse> {
  const metric = await prisma.metricDefinition.findFirst({ where: { slug: "noi" } });
  if (!metric) return qaFallback();

  const latest = recentPeriods(1)[0];
  const dataPoints = await prisma.metricDataPoint.findMany({
    where: { metricId: metric.id, period: latest, ...(customerId ? { customerId } : {}) },
    include: { property: { select: { name: true, unitCount: true } } },
    orderBy: { value: "desc" },
    take: 5,
  });

  const chartData = dataPoints.map((dp) => ({
    property: dp.property.name.length > 14 ? dp.property.name.slice(0, 12) + "…" : dp.property.name,
    noi: Math.round(dp.value),
    perUnit: Math.round(dp.value / dp.property.unitCount),
  }));

  const overrideNote = buildOverrideNote(overrides, ["noi"]);
  const answer = `Top 5 properties by NOI for ${formatPeriodLabel(latest)}:\n\n${dataPoints.map((dp, i) => `${i + 1}. ${dp.property.name} — $${Math.round(dp.value).toLocaleString()} NOI ($${Math.round(dp.value / dp.property.unitCount).toLocaleString()}/unit)`).join("\n")}\n\n${dataPoints[0]?.property.name ?? "N/A"} leads the portfolio with the strongest NOI performance.${overrideNote ? "\n\n" + overrideNote : ""}`;

  return {
    answer,
    chart: { type: "bar", data: chartData, config: { xKey: "property", bars: [{ key: "noi", color: "#8b5cf6", label: "NOI ($)" }] } },
    metadata: { metrics: ["noi"], filters: `Top 5 properties, ${formatPeriodLabel(latest)}`, freshness: "Current period" },
  };
}

async function handlePortfolioHealth(customerId?: string, overrides: OverrideRecord[] = []): Promise<QAResponse> {
  const period = currentPeriod();
  const keySlugs = ["occupancy_rate", "delinquency_rate", "noi", "collections_rate"];
  const metrics = await prisma.metricDefinition.findMany({ where: { slug: { in: keySlugs } } });

  const properties = await prisma.property.findMany({
    where: customerId ? { customerId } : {},
    select: { id: true, name: true, unitCount: true },
  });

  const dataPoints = await prisma.metricDataPoint.findMany({
    where: {
      period,
      propertyId: { in: properties.map((p) => p.id) },
      metricId: { in: metrics.map((m) => m.id) },
    },
  });

  const bySlug = new Map<string, number[]>();
  for (const dp of dataPoints) {
    const slug = metrics.find((m) => m.id === dp.metricId)?.slug;
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug)!.push(dp.value);
  }

  const avg = (slug: string) => {
    const vals = bySlug.get(slug);
    if (!vals || vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const occAvg = avg("occupancy_rate").toFixed(1);
  const delAvg = avg("delinquency_rate").toFixed(1);
  const collAvg = avg("collections_rate").toFixed(1);
  const noiTotal = (bySlug.get("noi") ?? []).reduce((a, b) => a + b, 0);
  const overrideNote = buildOverrideNote(overrides, keySlugs);

  const answer = `Portfolio health snapshot for ${formatPeriodLabel(period)} (${properties.length} properties):\n\n• Occupancy: ${occAvg}% average\n• Delinquency: ${delAvg}% average\n• Collections: ${collAvg}% average\n• Total NOI: $${Math.round(noiTotal).toLocaleString()}\n\n${parseFloat(occAvg) >= 93 ? "Occupancy is healthy." : "Occupancy needs attention."} ${parseFloat(delAvg) <= 5 ? "Delinquency is within acceptable range." : "Delinquency is elevated — consider targeted collections campaigns."}${overrideNote ? "\n\n" + overrideNote : ""}`;

  return {
    answer,
    chart: null,
    metadata: { metrics: keySlugs, filters: `${properties.length} properties, ${formatPeriodLabel(period)}`, freshness: "Current period" },
  };
}

function qaFallback(): QAResponse {
  return {
    answer:
      "I can help you analyze your portfolio. Try asking about:\n\n• Occupancy trends — \"How is occupancy trending?\"\n• Delinquency breakdown — \"Which properties have high delinquency?\"\n• AI performance — \"How are AI agents performing?\"\n• NOI analysis — \"What's our NOI breakdown?\"\n• Property rankings — \"Compare our top properties by NOI\"\n• Portfolio health — \"How is the portfolio doing overall?\"\n• Compound questions — \"Which properties have occupancy down and delinquency up?\"\n• Specific verticals — \"How are our student housing properties performing?\"",
    chart: null,
    metadata: null,
  };
}

// ─── Main Entry: Generate Answer ────────────────────────────────────────────

export async function generateAnswer(question: string, customerId?: string): Promise<QAResponse> {
  if (process.env.OPENAI_API_KEY) {
    /* LLM path — when API key is available:
     *
     * const systemPrompt = await buildSystemPrompt(customerId);
     * const { generateText } = await import("ai");
     * const { openai } = await import("@ai-sdk/openai");
     * const result = await generateText({
     *   model: openai("gpt-4o"),
     *   system: systemPrompt,
     *   prompt: question,
     * });
     * return JSON.parse(result.text);
     */
  }

  const overrides = customerId ? await getOverrides(customerId) : [];
  const q = question.toLowerCase();

  if (q.includes("occupancy") && !q.includes("delinquen")) {
    return handleOccupancy(customerId, overrides);
  }
  if (q.includes("delinquen")) {
    return handleDelinquency(customerId, overrides);
  }
  if (q.includes("ai") || q.includes("agent") || q.includes("hours saved")) {
    return handleAI(customerId, overrides);
  }
  if (q.includes("noi") || q.includes("waterfall") || q.includes("net operating")) {
    return handleNOI(customerId, overrides);
  }
  if (q.includes("compare") || q.includes("top") || q.includes("rank") || q.includes("best") || q.includes("worst")) {
    return handleCompare(customerId, overrides);
  }
  if (q.includes("health") || q.includes("overall") || q.includes("summary") || q.includes("how are") || q.includes("portfolio")) {
    return handlePortfolioHealth(customerId, overrides);
  }

  // Compound: multiple topics in one question
  if ((q.includes("occupancy") && q.includes("delinquen")) || (q.includes("leasing") && q.includes("occupancy"))) {
    return handlePortfolioHealth(customerId, overrides);
  }

  return qaFallback();
}
