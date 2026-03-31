"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/analytics/page-header";
import {
  FinancialStatementRenderer,
  MOCK_INCOME_STATEMENT,
  MOCK_PERIODS,
  type FinancialRow,
} from "@/components/analytics/financial-statement-renderer";
import { SaveReportPanel } from "@/components/analytics/save-report-panel";
import { cn } from "@/lib/utils";
import { Download, Printer, Save, ToggleLeft, ToggleRight, Calendar } from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import { DataFreshness } from "@/components/analytics/data-freshness";

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
  glData?: DataPoint[];
  properties?: PropertyInfo[];
  latestPeriod?: string;
}

const DATE_RANGES = [
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
  { label: "All", value: "all" },
] as const;

function Toggle({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  const Icon = enabled ? ToggleRight : ToggleLeft;
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border",
        enabled
          ? "bg-[#eddece] text-[#7d654e] border-[#e8dfd4]"
          : "text-[#7d654e]/70 hover:text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef]",
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function flattenRows(rows: FinancialRow[]): { label: string; values: Record<string, number | null> }[] {
  const flat: { label: string; values: Record<string, number | null> }[] = [];
  for (const row of rows) {
    flat.push({ label: row.label, values: row.values });
    if (row.children) flat.push(...flattenRows(row.children));
  }
  return flat;
}

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function buildFinancialRows(
  glData: DataPoint[],
  periods: string[],
  totalUnits: number,
): { rows: FinancialRow[]; displayPeriods: string[] } {
  const displayPeriods = periods.map(formatPeriodLabel);

  // Aggregate values across all properties for each metric + period
  const metricPeriodValues = new Map<string, Map<string, { actual: number; budget: number }>>();
  for (const dp of glData) {
    if (!periods.includes(dp.period)) continue;
    const label = formatPeriodLabel(dp.period);
    if (!metricPeriodValues.has(dp.metricSlug)) {
      metricPeriodValues.set(dp.metricSlug, new Map());
    }
    const periodMap = metricPeriodValues.get(dp.metricSlug)!;
    const existing = periodMap.get(label) ?? { actual: 0, budget: 0 };
    existing.actual += dp.value;
    existing.budget += dp.budgetValue ?? 0;
    periodMap.set(label, existing);
  }

  function metricValues(slug: string): Record<string, number | null> {
    const vals: Record<string, number | null> = {};
    const periodMap = metricPeriodValues.get(slug);
    if (!periodMap) return vals;
    let ytd = 0;
    for (const p of displayPeriods) {
      const v = periodMap.get(p);
      vals[p] = v ? Math.round(v.actual) : null;
      if (v) ytd += v.actual;
    }
    vals["YTD"] = Math.round(ytd);
    return vals;
  }

  function metricBudgets(slug: string): Record<string, number | null> {
    const vals: Record<string, number | null> = {};
    const periodMap = metricPeriodValues.get(slug);
    if (!periodMap) return vals;
    let ytd = 0;
    for (const p of displayPeriods) {
      const v = periodMap.get(p);
      vals[p] = v ? Math.round(v.budget) : null;
      if (v) ytd += v.budget;
    }
    vals["YTD"] = Math.round(ytd);
    return vals;
  }

  const allPeriods = [...displayPeriods, "YTD"];

  const rows: FinancialRow[] = [
    {
      id: "revenue",
      label: "Revenue",
      level: 0,
      isSectionHeader: true,
      values: {},
      children: [
        { id: "gpr", label: "Gross Potential Rent", level: 1, values: metricValues("gross_potential_rent"), budgetValues: metricBudgets("gross_potential_rent") },
        { id: "gtl", label: "Gain/Loss to Lease", level: 1, values: metricValues("loss_to_lease"), budgetValues: metricBudgets("loss_to_lease") },
        { id: "vacancy", label: "Vacancy Loss", level: 1, values: metricValues("vacancy_loss"), budgetValues: metricBudgets("vacancy_loss") },
        { id: "concessions", label: "Concessions", level: 1, values: metricValues("concessions"), budgetValues: metricBudgets("concessions") },
        { id: "bad_debt", label: "Bad Debt", level: 1, values: metricValues("bad_debt"), budgetValues: metricBudgets("bad_debt") },
        { id: "nri", label: "Net Rental Income", level: 1, isSubtotal: true, values: metricValues("net_rental_income"), budgetValues: metricBudgets("net_rental_income") },
        { id: "other_income", label: "Other Income", level: 1, values: metricValues("other_income"), budgetValues: metricBudgets("other_income") },
        { id: "egi", label: "Effective Gross Income", level: 1, isSubtotal: true, values: metricValues("effective_gross_income"), budgetValues: metricBudgets("effective_gross_income") },
      ],
    },
    {
      id: "opex",
      label: "Operating Expenses",
      level: 0,
      isSectionHeader: true,
      values: {},
      children: [
        {
          id: "controllable",
          label: "Controllable Expenses",
          level: 1,
          isSectionHeader: true,
          values: {},
          children: [
            { id: "payroll", label: "Payroll & Benefits", level: 2, values: metricValues("payroll"), budgetValues: metricBudgets("payroll") },
            { id: "repairs", label: "Repairs & Maintenance", level: 2, values: metricValues("repairs_maintenance"), budgetValues: metricBudgets("repairs_maintenance") },
            { id: "marketing", label: "Marketing & Advertising", level: 2, values: metricValues("marketing_expense"), budgetValues: metricBudgets("marketing_expense") },
            { id: "admin", label: "Administrative & Office", level: 2, values: metricValues("administrative"), budgetValues: metricBudgets("administrative") },
            { id: "contract_services", label: "Contract Services", level: 2, values: metricValues("contract_services"), budgetValues: metricBudgets("contract_services") },
            { id: "total_controllable", label: "Total Controllable", level: 2, isSubtotal: true, values: metricValues("total_controllable_expense"), budgetValues: metricBudgets("total_controllable_expense") },
          ],
        },
        {
          id: "non_controllable",
          label: "Non-Controllable Expenses",
          level: 1,
          isSectionHeader: true,
          values: {},
          children: [
            { id: "utilities", label: "Utilities", level: 2, values: metricValues("utilities"), budgetValues: metricBudgets("utilities") },
            { id: "insurance", label: "Insurance", level: 2, values: metricValues("insurance"), budgetValues: metricBudgets("insurance") },
            { id: "taxes", label: "Real Estate Taxes", level: 2, values: metricValues("property_taxes").YTD != null ? metricValues("property_taxes") : metricValues("taxes"), budgetValues: metricBudgets("property_taxes").YTD != null ? metricBudgets("property_taxes") : metricBudgets("taxes") },
            { id: "mgmt_fee", label: "Management Fee", level: 2, values: metricValues("management_fee"), budgetValues: metricBudgets("management_fee") },
            { id: "total_non_controllable", label: "Total Non-Controllable", level: 2, isSubtotal: true, values: metricValues("total_non_controllable_expense"), budgetValues: metricBudgets("total_non_controllable_expense") },
          ],
        },
        { id: "total_opex", label: "Total Operating Expenses", level: 1, isSubtotal: true, values: metricValues("total_operating_expense"), budgetValues: metricBudgets("total_operating_expense") },
      ],
    },
    {
      id: "noi_section",
      label: "Net Operating Income",
      level: 0,
      isSectionHeader: true,
      values: {},
      children: [
        { id: "noi", label: "Net Operating Income (NOI)", level: 1, isTotal: true, values: metricValues("net_operating_income").YTD != null ? metricValues("net_operating_income") : metricValues("noi"), budgetValues: metricBudgets("net_operating_income").YTD != null ? metricBudgets("net_operating_income") : metricBudgets("noi") },
      ],
    },
  ];

  return { rows, displayPeriods: allPeriods };
}

export function FinancialReportViewer({ template, glData = [], properties = [], latestPeriod: latestPeriodProp }: Props) {
  const [showVariance, setShowVariance] = useState(false);
  const [showPerUnit, setShowPerUnit] = useState(false);
  const [showPercentOfIncome, setShowPercentOfIncome] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [dateRange, setDateRange] = useState("3");
  const saveRef = useRef<HTMLDivElement>(null);

  const hasDbData = glData.length > 0;

  const totalUnits = useMemo(() => {
    return properties.reduce((sum, p) => sum + p.unitCount, 0) || 312;
  }, [properties]);

  // Get available periods from data
  const allPeriods = useMemo(() => {
    if (!hasDbData) return [];
    const periods = new Set<string>();
    for (const dp of glData) periods.add(dp.period);
    return Array.from(periods).sort();
  }, [glData, hasDbData]);

  // Filter periods by date range
  const filteredPeriods = useMemo(() => {
    if (!hasDbData) return [];
    if (dateRange === "all") return allPeriods;
    const count = parseInt(dateRange);
    return allPeriods.slice(-count);
  }, [allPeriods, dateRange, hasDbData]);

  // Build financial statement from DB data
  const { dbRows, dbPeriods } = useMemo(() => {
    if (!hasDbData || filteredPeriods.length === 0) {
      return { dbRows: null, dbPeriods: null };
    }
    const { rows, displayPeriods } = buildFinancialRows(glData, filteredPeriods, totalUnits);
    return { dbRows: rows, dbPeriods: displayPeriods };
  }, [glData, filteredPeriods, hasDbData, totalUnits]);

  const displayRows = dbRows ?? MOCK_INCOME_STATEMENT;
  const displayPeriods = dbPeriods ?? MOCK_PERIODS;

  const handleExport = useCallback(() => {
    const flat = flattenRows(displayRows);
    const cols = [
      { key: "label", label: "Line Item" },
      ...displayPeriods.map((p) => ({ key: p, label: p })),
    ];
    const data = flat.map((r) => ({
      label: r.label,
      ...Object.fromEntries(displayPeriods.map((p) => [p, r.values[p] ?? ""])),
    }));
    downloadCSV(data, cols, template.slug);
  }, [template.slug, displayRows, displayPeriods]);

  return (
    <>
      <PageHeader
        title={template.name}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#f7f3ef] hover:bg-[#eddece] border border-[#e8dfd4] text-[#1a1510] text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#f7f3ef] hover:bg-[#eddece] border border-[#e8dfd4] text-[#1a1510] text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={13} />
              Export
            </button>
            <div ref={saveRef} className="relative">
              <button
                onClick={() => setShowSave(!showSave)}
                className="flex items-center gap-1.5 bg-[#7d654e] hover:bg-[#7d654e]/90 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
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

      {template.description && (
        <p className="text-sm text-[#7d654e] -mt-4 mb-6">
          {template.description}
        </p>
      )}

      {(latestPeriodProp || allPeriods.length > 0) && (
        <DataFreshness
          latestPeriod={latestPeriodProp || allPeriods[allPeriods.length - 1]}
        />
      )}

      {/* Filter + toggle bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-[#e8dfd4]">
        {hasDbData && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
              <Calendar size={13} />
              <span>Period:</span>
            </div>
            <div className="flex items-center gap-1">
              {DATE_RANGES.map((dr) => (
                <button
                  key={dr.value}
                  onClick={() => setDateRange(dr.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    dateRange === dr.value
                      ? "bg-[#eddece] text-[#7d654e]"
                      : "text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef]",
                  )}
                >
                  {dr.label}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-[#e8dfd4] mx-1" />
          </>
        )}

        <span className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mr-2">
          Display
        </span>
        <Toggle
          label="Variance"
          enabled={showVariance}
          onChange={setShowVariance}
        />
        <Toggle
          label="Per Unit"
          enabled={showPerUnit}
          onChange={setShowPerUnit}
        />
        <Toggle
          label="% of EGI"
          enabled={showPercentOfIncome}
          onChange={setShowPercentOfIncome}
        />

        {hasDbData && (
          <div className="ml-auto text-xs text-[#7d654e] tabular-nums">
            {properties.length} properties · {filteredPeriods.length} periods
            {!dbRows && " (mock data)"}
          </div>
        )}
      </div>

      <FinancialStatementRenderer
        title={template.name}
        rows={displayRows}
        periods={displayPeriods}
        showVariance={showVariance}
        showPerUnit={showPerUnit}
        showPercentOfIncome={showPercentOfIncome}
        totalUnits={totalUnits}
        effectiveGrossIncomeKey="egi"
      />
    </>
  );
}
