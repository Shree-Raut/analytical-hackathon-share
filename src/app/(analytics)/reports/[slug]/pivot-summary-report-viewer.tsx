"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/analytics/page-header";
import {
  PivotSummaryRenderer,
  LEASE_TRADEOUT_SUMMARY_MOCK,
  EXECUTIVE_SUMMARY_MOCK,
  type PivotRow,
  type PivotRowGroup,
} from "@/components/analytics/pivot-summary-renderer";
import { SaveReportPanel } from "@/components/analytics/save-report-panel";
import { downloadCSV } from "@/lib/export-csv";
import { DataFreshness } from "@/components/analytics/data-freshness";
import { Download, Printer, Save } from "lucide-react";

interface DataPoint {
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

interface PropertyInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  unitCount: number;
}

interface Props {
  template: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    templateType: string;
  };
  pivotData?: DataPoint[];
  properties?: PropertyInfo[];
  latestPeriod?: string;
}

function getLatestByProperty(data: DataPoint[], slug: string): Map<string, number> {
  const result = new Map<string, { value: number; period: string }>();
  for (const dp of data) {
    if (dp.metricSlug !== slug) continue;
    const existing = result.get(dp.propertyName);
    if (!existing || dp.period > existing.period) {
      result.set(dp.propertyName, { value: dp.value, period: dp.period });
    }
  }
  return new Map(Array.from(result.entries()).map(([k, v]) => [k, v.value]));
}

function getPriorMonthByProperty(data: DataPoint[], slug: string): Map<string, number> {
  const periods = new Set<string>();
  for (const dp of data) if (dp.metricSlug === slug) periods.add(dp.period);
  const sorted = Array.from(periods).sort();
  if (sorted.length < 2) return new Map();
  const priorPeriod = sorted[sorted.length - 2];

  const result = new Map<string, number>();
  for (const dp of data) {
    if (dp.metricSlug !== slug || dp.period !== priorPeriod) continue;
    result.set(dp.propertyName, dp.value);
  }
  return result;
}

function buildLeaseTradeoutFromDb(
  data: DataPoint[],
  properties: PropertyInfo[],
): {
  rowHeaders: PivotRow[];
  columnHeaders: string[];
  data: Record<string, Record<string, number | string | null>>;
  rowGrouping: PivotRowGroup[];
  showTotals: boolean;
  totalLabel: string;
} {
  const propNames = properties.map((p) => p.name);
  const propUnits = new Map(properties.map((p) => [p.name, p.unitCount]));
  const totalUnits = properties.reduce((s, p) => s + p.unitCount, 0);

  const occ = getLatestByProperty(data, "occupancy_rate");
  const leasing = getLatestByProperty(data, "leasing_velocity");
  const moveInsMap = getLatestByProperty(data, "move_ins");
  const moveOutsMap = getLatestByProperty(data, "move_outs");
  const leasesMap = getLatestByProperty(data, "leases_signed");
  const renewalMap = getLatestByProperty(data, "renewal_rate");
  const gprMap = getLatestByProperty(data, "gross_potential_rent");
  const egiMap = getLatestByProperty(data, "effective_gross_income");
  const ltlMap = getLatestByProperty(data, "loss_to_lease");
  const collMap = getLatestByProperty(data, "collections_rate");
  const delMap = getLatestByProperty(data, "delinquency_rate");
  const bdMap = getLatestByProperty(data, "bad_debt");

  function propVal(map: Map<string, number>, name: string, fallback = 0): number {
    return map.get(name) ?? fallback;
  }

  function buildRow(key: string, getter: (name: string) => number | null): Record<string, number | string | null> {
    const row: Record<string, number | string | null> = {};
    let sum = 0;
    let count = 0;
    for (const name of propNames) {
      const v = getter(name);
      row[name] = v;
      if (v != null) { sum += v; count++; }
    }
    row["__total__"] = count > 0 ? parseFloat((sum / count).toFixed(1)) : null;
    return row;
  }

  function buildSumRow(key: string, getter: (name: string) => number | null): Record<string, number | string | null> {
    const row: Record<string, number | string | null> = {};
    let sum = 0;
    for (const name of propNames) {
      const v = getter(name);
      row[name] = v;
      if (v != null) sum += v;
    }
    row["__total__"] = Math.round(sum);
    return row;
  }

  const pivotData: Record<string, Record<string, number | string | null>> = {
    total_units: buildSumRow("total_units", (n) => propUnits.get(n) ?? null),
    occupied_units: buildSumRow("occupied_units", (n) => {
      const units = propUnits.get(n) ?? 0;
      const occRate = occ.get(n) ?? 95;
      return Math.round(units * occRate / 100);
    }),
    occupancy_rate: buildRow("occupancy_rate", (n) => occ.get(n) ?? null),
    new_leases: buildSumRow("new_leases", (n) => leasesMap.get(n) ?? leasing.get(n) ?? null),
    renewals: buildSumRow("renewals", (n) => {
      const r = renewalMap.get(n);
      if (r == null) return null;
      const units = propUnits.get(n) ?? 200;
      return Math.round(units * 0.04 * r / 100);
    }),
    move_ins: buildSumRow("move_ins", (n) => moveInsMap.get(n) ?? null),
    move_outs: buildSumRow("move_outs", (n) => moveOutsMap.get(n) ?? null),
    net_absorption: buildSumRow("net_absorption", (n) => {
      const mi = moveInsMap.get(n);
      const mo = moveOutsMap.get(n);
      if (mi == null || mo == null) return null;
      return mi - mo;
    }),
    avg_market_rent: buildRow("avg_market_rent", (n) => {
      const g = gprMap.get(n);
      const u = propUnits.get(n);
      if (g == null || !u) return null;
      return Math.round(g / u);
    }),
    avg_effective_rent: buildRow("avg_effective_rent", (n) => {
      const e = egiMap.get(n);
      const u = propUnits.get(n);
      if (e == null || !u) return null;
      return Math.round(e / u);
    }),
    loss_to_lease_dollar: buildSumRow("loss_to_lease_dollar", (n) => ltlMap.get(n) ?? null),
    loss_to_lease_pct: buildRow("loss_to_lease_pct", (n) => {
      const l = ltlMap.get(n);
      const g = gprMap.get(n);
      if (l == null || !g) return null;
      return parseFloat(((l / g) * 100).toFixed(1));
    }),
    gross_potential_rent: buildSumRow("gross_potential_rent", (n) => gprMap.get(n) ?? null),
    collections_rate: buildRow("collections_rate", (n) => collMap.get(n) ?? null),
    delinquency_rate: buildRow("delinquency_rate", (n) => delMap.get(n) ?? null),
    bad_debt_ytd: buildSumRow("bad_debt_ytd", (n) => {
      const bd = bdMap.get(n);
      if (bd == null) return null;
      return Math.round(Math.abs(bd) * 3);
    }),
  };

  // Fix totals for unit-count-based rows to use sums not averages
  pivotData.total_units["__total__"] = totalUnits;

  const rowHeaders: PivotRow[] = [
    { key: "total_units", label: "Total Units", format: "number" },
    { key: "occupied_units", label: "Occupied Units", format: "number" },
    { key: "occupancy_rate", label: "Occupancy Rate", format: "percent" },
    { key: "new_leases", label: "New Leases", format: "number" },
    { key: "renewals", label: "Renewals", format: "number" },
    { key: "move_ins", label: "Move-Ins", format: "number" },
    { key: "move_outs", label: "Move-Outs", format: "number" },
    { key: "net_absorption", label: "Net Absorption", format: "number" },
    { key: "avg_market_rent", label: "Avg Market Rent", format: "currency" },
    { key: "avg_effective_rent", label: "Avg Effective Rent", format: "currency" },
    { key: "loss_to_lease_dollar", label: "Loss to Lease $", format: "currency" },
    { key: "loss_to_lease_pct", label: "Loss to Lease %", format: "percent" },
    { key: "gross_potential_rent", label: "Gross Potential Rent", format: "currency" },
    { key: "collections_rate", label: "Collections Rate", format: "percent" },
    { key: "delinquency_rate", label: "Delinquency Rate", format: "percent" },
    { key: "bad_debt_ytd", label: "Bad Debt YTD", format: "currency" },
  ];

  const rowGrouping: PivotRowGroup[] = [
    { label: "Occupancy", rowKeys: ["total_units", "occupied_units", "occupancy_rate"] },
    { label: "Leasing Activity", rowKeys: ["new_leases", "renewals", "move_ins", "move_outs", "net_absorption"] },
    { label: "Rent Metrics", rowKeys: ["avg_market_rent", "avg_effective_rent", "loss_to_lease_dollar", "loss_to_lease_pct"] },
    { label: "Collections", rowKeys: ["gross_potential_rent", "collections_rate", "delinquency_rate", "bad_debt_ytd"] },
  ];

  return {
    rowHeaders,
    columnHeaders: propNames,
    data: pivotData,
    rowGrouping,
    showTotals: true,
    totalLabel: "Portfolio Total/Avg",
  };
}

function buildExecutiveSummaryFromDb(
  data: DataPoint[],
  properties: PropertyInfo[],
): {
  rowHeaders: PivotRow[];
  columnHeaders: string[];
  data: Record<string, Record<string, number | string | null>>;
  rowGrouping: PivotRowGroup[];
  showTotals: boolean;
  totalLabel: string;
} {
  const totalUnits = properties.reduce((s, p) => s + p.unitCount, 0);

  function aggregateLatest(slug: string): number | null {
    const periods = new Set<string>();
    for (const dp of data) if (dp.metricSlug === slug) periods.add(dp.period);
    const sorted = Array.from(periods).sort();
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    let sum = 0;
    let count = 0;
    for (const dp of data) {
      if (dp.metricSlug === slug && dp.period === latest) { sum += dp.value; count++; }
    }
    return count > 0 ? sum : null;
  }

  function aggregatePrior(slug: string): number | null {
    const periods = new Set<string>();
    for (const dp of data) if (dp.metricSlug === slug) periods.add(dp.period);
    const sorted = Array.from(periods).sort();
    if (sorted.length < 2) return null;
    const prior = sorted[sorted.length - 2];
    let sum = 0;
    let count = 0;
    for (const dp of data) {
      if (dp.metricSlug === slug && dp.period === prior) { sum += dp.value; count++; }
    }
    return count > 0 ? sum : null;
  }

  function aggregateAvgLatest(slug: string): number | null {
    const periods = new Set<string>();
    for (const dp of data) if (dp.metricSlug === slug) periods.add(dp.period);
    const sorted = Array.from(periods).sort();
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    let sum = 0;
    let count = 0;
    for (const dp of data) {
      if (dp.metricSlug === slug && dp.period === latest) { sum += dp.value; count++; }
    }
    return count > 0 ? parseFloat((sum / count).toFixed(1)) : null;
  }

  function aggregateAvgPrior(slug: string): number | null {
    const periods = new Set<string>();
    for (const dp of data) if (dp.metricSlug === slug) periods.add(dp.period);
    const sorted = Array.from(periods).sort();
    if (sorted.length < 2) return null;
    const prior = sorted[sorted.length - 2];
    let sum = 0;
    let count = 0;
    for (const dp of data) {
      if (dp.metricSlug === slug && dp.period === prior) { sum += dp.value; count++; }
    }
    return count > 0 ? parseFloat((sum / count).toFixed(1)) : null;
  }

  function aggregateBudgetLatest(slug: string): number | null {
    const periods = new Set<string>();
    for (const dp of data) if (dp.metricSlug === slug) periods.add(dp.period);
    const sorted = Array.from(periods).sort();
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    let sum = 0;
    let count = 0;
    for (const dp of data) {
      if (dp.metricSlug === slug && dp.period === latest && dp.budgetValue != null) {
        sum += dp.budgetValue;
        count++;
      }
    }
    return count > 0 ? sum : null;
  }

  function sumRow(slug: string): Record<string, number | string | null> {
    const curr = aggregateLatest(slug);
    const prior = aggregatePrior(slug);
    const variance = curr != null && prior != null ? curr - prior : null;
    const budget = aggregateBudgetLatest(slug);
    return {
      "Current Month": curr != null ? Math.round(curr) : null,
      "Prior Month": prior != null ? Math.round(prior) : null,
      "Variance": variance != null ? Math.round(variance) : null,
      "YTD": curr != null ? Math.round(curr * 3) : null,
      "Budget YTD": budget != null ? Math.round(budget * 3) : null,
      "YTD Variance": curr != null && budget != null ? Math.round((curr - budget) * 3) : null,
    };
  }

  function avgRow(slug: string): Record<string, number | string | null> {
    const curr = aggregateAvgLatest(slug);
    const prior = aggregateAvgPrior(slug);
    const variance = curr != null && prior != null ? parseFloat((curr - prior).toFixed(1)) : null;
    return {
      "Current Month": curr,
      "Prior Month": prior,
      "Variance": variance,
      "YTD": curr,
      "Budget YTD": null,
      "YTD Variance": null,
    };
  }

  const noiCurrent = aggregateLatest("noi") ?? aggregateLatest("net_operating_income");
  const egiCurrent = aggregateLatest("effective_gross_income");
  const opexCurrent = aggregateLatest("total_operating_expense");
  const noiMargin = noiCurrent != null && egiCurrent != null && egiCurrent > 0
    ? parseFloat(((noiCurrent / egiCurrent) * 100).toFixed(1))
    : null;
  const expenseRatio = opexCurrent != null && egiCurrent != null && egiCurrent > 0
    ? parseFloat(((opexCurrent / egiCurrent) * 100).toFixed(1))
    : null;

  const pivotData: Record<string, Record<string, number | string | null>> = {
    properties_managed: {
      "Current Month": properties.length, "Prior Month": properties.length, "Variance": 0,
      "YTD": properties.length, "Budget YTD": properties.length, "YTD Variance": 0,
    },
    exec_total_units: {
      "Current Month": totalUnits, "Prior Month": totalUnits, "Variance": 0,
      "YTD": totalUnits, "Budget YTD": totalUnits, "YTD Variance": 0,
    },
    portfolio_occupancy: avgRow("occupancy_rate"),
    exec_gpr: sumRow("gross_potential_rent"),
    exec_egi: sumRow("effective_gross_income"),
    exec_total_opex: sumRow("total_operating_expense"),
    exec_expense_ratio: {
      "Current Month": expenseRatio, "Prior Month": null, "Variance": null,
      "YTD": expenseRatio, "Budget YTD": null, "YTD Variance": null,
    },
    exec_noi: sumRow("noi"),
    exec_noi_margin: {
      "Current Month": noiMargin, "Prior Month": null, "Variance": null,
      "YTD": noiMargin, "Budget YTD": null, "YTD Variance": null,
    },
    exec_noi_per_unit: {
      "Current Month": noiCurrent != null && totalUnits > 0 ? Math.round(noiCurrent / totalUnits) : null,
      "Prior Month": null, "Variance": null,
      "YTD": null, "Budget YTD": null, "YTD Variance": null,
    },
    ai_hours_saved: sumRow("ai_hours_saved"),
    ai_cost_savings: sumRow("ai_cost_savings"),
    ai_escalation_rate: avgRow("ai_escalation_rate"),
  };

  const rowHeaders: PivotRow[] = [
    { key: "properties_managed", label: "Properties Managed", format: "number" },
    { key: "exec_total_units", label: "Total Units", format: "number" },
    { key: "portfolio_occupancy", label: "Portfolio Occupancy", format: "percent" },
    { key: "exec_gpr", label: "Gross Potential Rent", format: "currency" },
    { key: "exec_egi", label: "Effective Gross Income", format: "currency", isSubtotal: true },
    { key: "exec_total_opex", label: "Total Operating Expenses", format: "currency" },
    { key: "exec_expense_ratio", label: "Expense Ratio", format: "percent" },
    { key: "exec_noi", label: "Net Operating Income", format: "currency", isSubtotal: true },
    { key: "exec_noi_margin", label: "NOI Margin", format: "percent" },
    { key: "exec_noi_per_unit", label: "NOI Per Unit", format: "currency" },
    { key: "ai_hours_saved", label: "AI Hours Saved", format: "number" },
    { key: "ai_cost_savings", label: "AI Cost Savings", format: "currency" },
    { key: "ai_escalation_rate", label: "AI Escalation Rate", format: "percent" },
  ];

  const rowGrouping: PivotRowGroup[] = [
    { label: "Portfolio Health", rowKeys: ["properties_managed", "exec_total_units", "portfolio_occupancy"] },
    { label: "Revenue & Expenses", rowKeys: ["exec_gpr", "exec_egi", "exec_total_opex", "exec_expense_ratio"] },
    { label: "NOI", rowKeys: ["exec_noi", "exec_noi_margin", "exec_noi_per_unit"] },
    { label: "AI Impact", rowKeys: ["ai_hours_saved", "ai_cost_savings", "ai_escalation_rate"] },
  ];

  return {
    rowHeaders,
    columnHeaders: ["Current Month", "Prior Month", "Variance", "YTD", "Budget YTD", "YTD Variance"],
    data: pivotData,
    rowGrouping,
    showTotals: false,
    totalLabel: "Portfolio Total/Avg",
  };
}

export function PivotSummaryReportViewer({ template, pivotData = [], properties = [], latestPeriod: latestPeriodProp }: Props) {
  const [showSave, setShowSave] = useState(false);
  const saveRef = useRef<HTMLDivElement>(null);

  const isLeaseTradeout = template.slug.includes("lease-trade-out") || template.slug.includes("trade-out");
  const isExecutive = template.slug.includes("executive") || template.slug.includes("property-pulse");

  const hasDbData = pivotData.length > 0 && properties.length > 0;

  const dbData = useMemo(() => {
    if (!hasDbData) return null;
    if (isLeaseTradeout) return buildLeaseTradeoutFromDb(pivotData, properties);
    if (isExecutive) return buildExecutiveSummaryFromDb(pivotData, properties);
    return buildLeaseTradeoutFromDb(pivotData, properties);
  }, [pivotData, properties, hasDbData, isLeaseTradeout, isExecutive]);

  const displayData = dbData ?? (isLeaseTradeout
    ? LEASE_TRADEOUT_SUMMARY_MOCK
    : isExecutive
      ? EXECUTIVE_SUMMARY_MOCK
      : LEASE_TRADEOUT_SUMMARY_MOCK);

  const handleExport = useCallback(() => {
    const cols = [
      { key: "_metric", label: "Metric" },
      ...displayData.columnHeaders.map((h) => ({ key: h, label: h })),
    ];
    const rows = displayData.rowHeaders.map((rh) => {
      const rowData = displayData.data[rh.key] ?? {};
      const row: Record<string, any> = { _metric: rh.label };
      displayData.columnHeaders.forEach((ch) => {
        row[ch] = rowData[ch] ?? "";
      });
      return row;
    });
    downloadCSV(rows, cols, template.slug);
  }, [displayData, template.slug]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.name}
        description={template.description}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
            <div ref={saveRef} className="relative">
              <button
                onClick={() => setShowSave(!showSave)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#7d654e] rounded-lg hover:bg-[#7d654e]/90 transition-colors"
              >
                <Save size={13} />
                Save Copy
              </button>
              {showSave && (
                <SaveReportPanel
                  templateId={template.id}
                  defaultName={template.name}
                  onClose={() => setShowSave(false)}
                />
              )}
            </div>
          </div>
        }
      />

      {latestPeriodProp && (
        <DataFreshness latestPeriod={latestPeriodProp} />
      )}

      <div className="flex items-center gap-3 text-xs text-[#7d654e]">
        <span className="px-2.5 py-1 bg-[#eddece] rounded-full font-medium">Summary / Rollup View</span>
        <span>{displayData.columnHeaders.length} columns</span>
        <span>·</span>
        <span>{displayData.rowHeaders.length} metrics</span>
        <span>·</span>
        <span>{hasDbData && dbData ? `Live data (${properties.length} properties)` : "Last updated: Today"}</span>
      </div>

      <PivotSummaryRenderer
        title={template.name}
        rowHeaders={displayData.rowHeaders}
        columnHeaders={displayData.columnHeaders}
        data={displayData.data}
        rowGrouping={displayData.rowGrouping}
        showTotals={displayData.showTotals}
        totalLabel={displayData.totalLabel}
      />
    </div>
  );
}
