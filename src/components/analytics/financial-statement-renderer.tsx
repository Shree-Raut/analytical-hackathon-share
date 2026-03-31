"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface FinancialRow {
  id: string;
  label: string;
  level: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isSectionHeader?: boolean;
  values: Record<string, number | null>;
  budgetValues?: Record<string, number | null>;
  priorYearValues?: Record<string, number | null>;
  children?: FinancialRow[];
  collapsed?: boolean;
}

export interface FinancialStatementProps {
  title: string;
  rows: FinancialRow[];
  periods: string[];
  showVariance?: boolean;
  showPerUnit?: boolean;
  showPercentOfIncome?: boolean;
  totalUnits?: number;
  effectiveGrossIncomeKey?: string;
  className?: string;
}

/* ─── Formatting ─────────────────────────────────────────────────────────── */

function formatCurrency(value: number | null): string {
  if (value == null) return "—";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  if (value < 0) return `($${formatted})`;
  return `$${formatted}`;
}

function formatPercent(value: number | null): string {
  if (value == null) return "—";
  const abs = Math.abs(value);
  const formatted = abs.toFixed(1);
  if (value < 0) return `(${formatted}%)`;
  return `${formatted}%`;
}

function formatPerUnit(value: number | null, units: number): string {
  if (value == null || units === 0) return "—";
  const perUnit = value / units;
  const abs = Math.abs(perUnit);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (perUnit < 0) return `($${formatted})`;
  return `$${formatted}`;
}

/* ─── Row Component ──────────────────────────────────────────────────────── */

function StatementRow({
  row,
  periods,
  showVariance,
  showPerUnit,
  showPercentOfIncome,
  totalUnits,
  egiValues,
  collapsedIds,
  onToggle,
  depth,
}: {
  row: FinancialRow;
  periods: string[];
  showVariance: boolean;
  showPerUnit: boolean;
  showPercentOfIncome: boolean;
  totalUnits: number;
  egiValues: Record<string, number>;
  collapsedIds: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  const isCollapsed = collapsedIds.has(row.id);
  const hasChildren = row.children && row.children.length > 0;
  const isClickable = row.isSectionHeader && hasChildren;

  const indent = row.level * 16;

  return (
    <>
      <tr
        className={cn(
          "group transition-colors",
          row.isSectionHeader &&
            "bg-[#faf7f4] border-b border-[#e8dfd4]",
          row.isSubtotal && "border-t border-[#e8dfd4]",
          row.isTotal && "border-t-2 border-[#1a1510]",
          !row.isSectionHeader &&
            !row.isSubtotal &&
            !row.isTotal &&
            "hover:bg-[#f7f3ef]"
        )}
      >
        {/* Label cell */}
        <td
          className={cn(
            "py-2 pr-3 text-sm whitespace-nowrap",
            row.isSectionHeader && "font-semibold text-[#1a1510] uppercase text-xs tracking-wider",
            row.isSubtotal && "font-semibold text-[#1a1510]",
            row.isTotal && "font-bold text-[#1a1510]",
            !row.isSectionHeader &&
              !row.isSubtotal &&
              !row.isTotal &&
              "text-[#1a1510]/80"
          )}
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          <span className="inline-flex items-center gap-1.5">
            {isClickable && (
              <button
                onClick={() => onToggle(row.id)}
                className="p-0.5 -ml-5 text-[#7d654e]/60 hover:text-[#7d654e] transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>
            )}
            {row.label}
          </span>
        </td>

        {/* Value cells for each period */}
        {periods.map((period) => {
          const val = row.values[period] ?? null;
          const isNeg = val != null && val < 0;
          return (
            <td
              key={period}
              className={cn(
                "py-2 px-3 text-sm text-right tabular-nums whitespace-nowrap",
                row.isSectionHeader && "font-semibold",
                row.isSubtotal && "font-semibold",
                row.isTotal && "font-bold",
                isNeg && "text-red-600",
                !row.isSectionHeader &&
                  !row.isSubtotal &&
                  !row.isTotal &&
                  !isNeg &&
                  "text-[#1a1510]/80"
              )}
            >
              {row.isSectionHeader ? "" : formatCurrency(val)}
            </td>
          );
        })}

        {/* Variance columns */}
        {showVariance &&
          periods.map((period) => {
            const actual = row.values[period] ?? null;
            const budget = row.budgetValues?.[period] ?? null;
            if (row.isSectionHeader)
              return (
                <td key={`var-${period}`} className="py-2 px-3" colSpan={1}>
                  {""}
                </td>
              );
            const dollarVar =
              actual != null && budget != null ? actual - budget : null;
            const pctVar =
              actual != null && budget != null && budget !== 0
                ? ((actual - budget) / Math.abs(budget)) * 100
                : null;
            const isNeg = dollarVar != null && dollarVar < 0;
            return (
              <td
                key={`var-${period}`}
                className={cn(
                  "py-2 px-2 text-right tabular-nums whitespace-nowrap text-xs",
                  isNeg ? "text-red-600" : "text-emerald-700"
                )}
              >
                {dollarVar != null && (
                  <span className="flex items-center justify-end gap-1.5">
                    <span>{formatCurrency(dollarVar)}</span>
                    <span className="text-[#7d654e]/40">
                      {formatPercent(pctVar)}
                    </span>
                  </span>
                )}
              </td>
            );
          })}

        {/* Per Unit column */}
        {showPerUnit && (
          <td
            className={cn(
              "py-2 px-3 text-right tabular-nums whitespace-nowrap text-xs",
              row.isSectionHeader && "font-semibold",
              row.isSubtotal && "font-semibold",
              row.isTotal && "font-bold"
            )}
          >
            {row.isSectionHeader
              ? ""
              : formatPerUnit(
                  row.values[periods[periods.length - 1]] ?? null,
                  totalUnits
                )}
          </td>
        )}

        {/* % of Income column */}
        {showPercentOfIncome && (
          <td
            className={cn(
              "py-2 px-3 text-right tabular-nums whitespace-nowrap text-xs text-[#7d654e]",
              row.isSectionHeader && "font-semibold",
              row.isSubtotal && "font-semibold",
              row.isTotal && "font-bold"
            )}
          >
            {(() => {
              if (row.isSectionHeader) return "";
              const lastPeriod = periods[periods.length - 1];
              const val = row.values[lastPeriod];
              const egi = egiValues[lastPeriod];
              if (val == null || !egi) return "—";
              return formatPercent((val / Math.abs(egi)) * 100);
            })()}
          </td>
        )}
      </tr>

      {/* Render children if not collapsed */}
      {hasChildren &&
        !isCollapsed &&
        row.children!.map((child) => (
          <StatementRow
            key={child.id}
            row={child}
            periods={periods}
            showVariance={showVariance}
            showPerUnit={showPerUnit}
            showPercentOfIncome={showPercentOfIncome}
            totalUnits={totalUnits}
            egiValues={egiValues}
            collapsedIds={collapsedIds}
            onToggle={onToggle}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function FinancialStatementRenderer({
  title,
  rows,
  periods,
  showVariance = false,
  showPerUnit = false,
  showPercentOfIncome = false,
  totalUnits = 312,
  effectiveGrossIncomeKey = "egi",
  className,
}: FinancialStatementProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const row of rows) {
      if (row.collapsed) initial.add(row.id);
    }
    return initial;
  });

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const egiValues = useMemo(() => {
    const vals: Record<string, number> = {};
    function findEgi(rows: FinancialRow[]) {
      for (const row of rows) {
        if (row.id === effectiveGrossIncomeKey) {
          for (const [period, val] of Object.entries(row.values)) {
            if (val != null) vals[period] = val;
          }
          return;
        }
        if (row.children) findEgi(row.children);
      }
    }
    findEgi(rows);
    return vals;
  }, [rows, effectiveGrossIncomeKey]);

  const variancePeriods = showVariance
    ? periods.filter((p) => {
        for (const row of rows) {
          if (row.budgetValues?.[p] != null) return true;
          if (row.children) {
            for (const child of row.children) {
              if (child.budgetValues?.[p] != null) return true;
            }
          }
        }
        return false;
      })
    : [];

  return (
    <div
      className={cn(
        "rounded-xl border border-[#e8dfd4] bg-white shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Title bar */}
      <div className="px-5 py-3 border-b border-[#e8dfd4] bg-[#faf7f4]">
        <h2 className="text-sm font-semibold text-[#1a1510]">{title}</h2>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#faf7f4] border-b border-[#e8dfd4]">
              <th className="text-left py-2.5 pl-3 pr-3 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold w-[280px] min-w-[280px]">
                Account
              </th>
              {periods.map((period) => (
                <th
                  key={period}
                  className="text-right py-2.5 px-3 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold min-w-[110px]"
                >
                  {period}
                </th>
              ))}
              {showVariance &&
                variancePeriods.map((period) => (
                  <th
                    key={`var-h-${period}`}
                    className="text-right py-2.5 px-2 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold min-w-[140px]"
                  >
                    Var ({period})
                  </th>
                ))}
              {showPerUnit && (
                <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold min-w-[90px]">
                  Per Unit
                </th>
              )}
              {showPercentOfIncome && (
                <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold min-w-[80px]">
                  % of EGI
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <StatementRow
                key={row.id}
                row={row}
                periods={periods}
                showVariance={showVariance && variancePeriods.length > 0}
                showPerUnit={showPerUnit}
                showPercentOfIncome={showPercentOfIncome}
                totalUnits={totalUnits}
                egiValues={egiValues}
                collapsedIds={collapsedIds}
                onToggle={toggleCollapse}
                depth={0}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Realistic multifamily Income Statement (312-unit Class B)
   ═══════════════════════════════════════════════════════════════════════════ */

export const MOCK_INCOME_STATEMENT: FinancialRow[] = [
  // ─── REVENUE ────────────────────────────────────────────────────────────
  {
    id: "revenue",
    label: "Revenue",
    level: 0,
    isSectionHeader: true,
    values: {},
    children: [
      {
        id: "gpr",
        label: "Gross Potential Rent",
        level: 1,
        values: { "Jan 2026": 468000, "Feb 2026": 468000, "Mar 2026": 471744, YTD: 1407744 },
        budgetValues: { "Jan 2026": 470000, "Feb 2026": 470000, "Mar 2026": 470000, YTD: 1410000 },
      },
      {
        id: "gtl",
        label: "Gain/Loss to Lease",
        level: 1,
        values: { "Jan 2026": -11232, "Feb 2026": -10530, "Mar 2026": -9360, YTD: -31122 },
        budgetValues: { "Jan 2026": -12000, "Feb 2026": -12000, "Mar 2026": -12000, YTD: -36000 },
      },
      {
        id: "vacancy",
        label: "Vacancy Loss",
        level: 1,
        values: { "Jan 2026": -23400, "Feb 2026": -21060, "Mar 2026": -18720, YTD: -63180 },
        budgetValues: { "Jan 2026": -23500, "Feb 2026": -23500, "Mar 2026": -23500, YTD: -70500 },
      },
      {
        id: "concessions",
        label: "Concessions",
        level: 1,
        values: { "Jan 2026": -7020, "Feb 2026": -5616, "Mar 2026": -4680, YTD: -17316 },
        budgetValues: { "Jan 2026": -6000, "Feb 2026": -6000, "Mar 2026": -6000, YTD: -18000 },
      },
      {
        id: "bad_debt",
        label: "Bad Debt",
        level: 1,
        values: { "Jan 2026": -4212, "Feb 2026": -3744, "Mar 2026": -3276, YTD: -11232 },
        budgetValues: { "Jan 2026": -4500, "Feb 2026": -4500, "Mar 2026": -4500, YTD: -13500 },
      },
      {
        id: "nri",
        label: "Net Rental Income",
        level: 1,
        isSubtotal: true,
        values: { "Jan 2026": 422136, "Feb 2026": 427050, "Mar 2026": 435708, YTD: 1284894 },
        budgetValues: { "Jan 2026": 424000, "Feb 2026": 424000, "Mar 2026": 424000, YTD: 1272000 },
      },
      {
        id: "other_income",
        label: "Other Income",
        level: 1,
        values: { "Jan 2026": 28080, "Feb 2026": 29640, "Mar 2026": 31200, YTD: 88920 },
        budgetValues: { "Jan 2026": 27000, "Feb 2026": 27000, "Mar 2026": 27000, YTD: 81000 },
        children: [
          {
            id: "parking",
            label: "Parking Income",
            level: 2,
            values: { "Jan 2026": 9360, "Feb 2026": 9360, "Mar 2026": 9672, YTD: 28392 },
            budgetValues: { "Jan 2026": 9000, "Feb 2026": 9000, "Mar 2026": 9000, YTD: 27000 },
          },
          {
            id: "pet_fees",
            label: "Pet Fees",
            level: 2,
            values: { "Jan 2026": 4680, "Feb 2026": 4680, "Mar 2026": 4992, YTD: 14352 },
            budgetValues: { "Jan 2026": 4500, "Feb 2026": 4500, "Mar 2026": 4500, YTD: 13500 },
          },
          {
            id: "late_fees",
            label: "Late Fees & NSF",
            level: 2,
            values: { "Jan 2026": 6240, "Feb 2026": 7800, "Mar 2026": 8736, YTD: 22776 },
            budgetValues: { "Jan 2026": 5500, "Feb 2026": 5500, "Mar 2026": 5500, YTD: 16500 },
          },
          {
            id: "misc_income",
            label: "Miscellaneous Income",
            level: 2,
            values: { "Jan 2026": 7800, "Feb 2026": 7800, "Mar 2026": 7800, YTD: 23400 },
            budgetValues: { "Jan 2026": 8000, "Feb 2026": 8000, "Mar 2026": 8000, YTD: 24000 },
          },
        ],
      },
      {
        id: "egi",
        label: "Effective Gross Income",
        level: 1,
        isSubtotal: true,
        values: { "Jan 2026": 450216, "Feb 2026": 456690, "Mar 2026": 466908, YTD: 1373814 },
        budgetValues: { "Jan 2026": 451000, "Feb 2026": 451000, "Mar 2026": 451000, YTD: 1353000 },
      },
    ],
  },

  // ─── OPERATING EXPENSES ─────────────────────────────────────────────────
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
          {
            id: "payroll",
            label: "Payroll & Benefits",
            level: 2,
            values: { "Jan 2026": 58500, "Feb 2026": 58500, "Mar 2026": 60450, YTD: 177450 },
            budgetValues: { "Jan 2026": 59000, "Feb 2026": 59000, "Mar 2026": 59000, YTD: 177000 },
          },
          {
            id: "repairs",
            label: "Repairs & Maintenance",
            level: 2,
            values: { "Jan 2026": 24960, "Feb 2026": 22464, "Mar 2026": 21840, YTD: 69264 },
            budgetValues: { "Jan 2026": 22000, "Feb 2026": 22000, "Mar 2026": 22000, YTD: 66000 },
          },
          {
            id: "turnover",
            label: "Turnover Costs",
            level: 2,
            values: { "Jan 2026": 8736, "Feb 2026": 7488, "Mar 2026": 9984, YTD: 26208 },
            budgetValues: { "Jan 2026": 8500, "Feb 2026": 8500, "Mar 2026": 8500, YTD: 25500 },
          },
          {
            id: "marketing",
            label: "Marketing & Advertising",
            level: 2,
            values: { "Jan 2026": 5616, "Feb 2026": 5304, "Mar 2026": 4680, YTD: 15600 },
            budgetValues: { "Jan 2026": 5000, "Feb 2026": 5000, "Mar 2026": 5000, YTD: 15000 },
          },
          {
            id: "admin",
            label: "Administrative & Office",
            level: 2,
            values: { "Jan 2026": 3744, "Feb 2026": 3432, "Mar 2026": 3588, YTD: 10764 },
            budgetValues: { "Jan 2026": 3500, "Feb 2026": 3500, "Mar 2026": 3500, YTD: 10500 },
          },
          {
            id: "contract_services",
            label: "Contract Services",
            level: 2,
            values: { "Jan 2026": 6864, "Feb 2026": 6864, "Mar 2026": 7176, YTD: 20904 },
            budgetValues: { "Jan 2026": 7000, "Feb 2026": 7000, "Mar 2026": 7000, YTD: 21000 },
          },
          {
            id: "total_controllable",
            label: "Total Controllable",
            level: 2,
            isSubtotal: true,
            values: { "Jan 2026": 108420, "Feb 2026": 104052, "Mar 2026": 107718, YTD: 320190 },
            budgetValues: { "Jan 2026": 105000, "Feb 2026": 105000, "Mar 2026": 105000, YTD: 315000 },
          },
        ],
      },
      {
        id: "non_controllable",
        label: "Non-Controllable Expenses",
        level: 1,
        isSectionHeader: true,
        values: {},
        children: [
          {
            id: "utilities",
            label: "Utilities",
            level: 2,
            values: { "Jan 2026": 18720, "Feb 2026": 16848, "Mar 2026": 15600, YTD: 51168 },
            budgetValues: { "Jan 2026": 17000, "Feb 2026": 17000, "Mar 2026": 17000, YTD: 51000 },
          },
          {
            id: "insurance",
            label: "Insurance",
            level: 2,
            values: { "Jan 2026": 10296, "Feb 2026": 10296, "Mar 2026": 10296, YTD: 30888 },
            budgetValues: { "Jan 2026": 10000, "Feb 2026": 10000, "Mar 2026": 10000, YTD: 30000 },
          },
          {
            id: "taxes",
            label: "Real Estate Taxes",
            level: 2,
            values: { "Jan 2026": 35100, "Feb 2026": 35100, "Mar 2026": 35100, YTD: 105300 },
            budgetValues: { "Jan 2026": 35000, "Feb 2026": 35000, "Mar 2026": 35000, YTD: 105000 },
          },
          {
            id: "mgmt_fee",
            label: "Management Fee",
            level: 2,
            values: { "Jan 2026": 13507, "Feb 2026": 13701, "Mar 2026": 14007, YTD: 41215 },
            budgetValues: { "Jan 2026": 13530, "Feb 2026": 13530, "Mar 2026": 13530, YTD: 40590 },
          },
          {
            id: "total_non_controllable",
            label: "Total Non-Controllable",
            level: 2,
            isSubtotal: true,
            values: { "Jan 2026": 77623, "Feb 2026": 75945, "Mar 2026": 75003, YTD: 228571 },
            budgetValues: { "Jan 2026": 75530, "Feb 2026": 75530, "Mar 2026": 75530, YTD: 226590 },
          },
        ],
      },
      {
        id: "total_opex",
        label: "Total Operating Expenses",
        level: 1,
        isSubtotal: true,
        values: { "Jan 2026": 186043, "Feb 2026": 179997, "Mar 2026": 182721, YTD: 548761 },
        budgetValues: { "Jan 2026": 180530, "Feb 2026": 180530, "Mar 2026": 180530, YTD: 541590 },
      },
    ],
  },

  // ─── NET OPERATING INCOME ───────────────────────────────────────────────
  {
    id: "noi_section",
    label: "Net Operating Income",
    level: 0,
    isSectionHeader: true,
    values: {},
    children: [
      {
        id: "noi",
        label: "Net Operating Income (NOI)",
        level: 1,
        isTotal: true,
        values: { "Jan 2026": 264173, "Feb 2026": 276693, "Mar 2026": 284187, YTD: 825053 },
        budgetValues: { "Jan 2026": 270470, "Feb 2026": 270470, "Mar 2026": 270470, YTD: 811410 },
      },
    ],
  },
];

export const MOCK_PERIODS = ["Jan 2026", "Feb 2026", "Mar 2026", "YTD"];
