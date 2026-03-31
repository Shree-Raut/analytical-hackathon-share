"use client";

import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface PivotRow {
  key: string;
  label: string;
  format?: "currency" | "percent" | "number" | "text";
  isSubtotal?: boolean;
  isSectionHeader?: boolean;
  indent?: number;
}

export interface PivotRowGroup {
  label: string;
  rowKeys: string[];
}

export interface PivotSummaryRendererProps {
  title: string;
  rowHeaders: PivotRow[];
  columnHeaders: string[];
  data: Record<string, Record<string, number | string | null>>;
  rowGrouping?: PivotRowGroup[];
  showTotals?: boolean;
  totalLabel?: string;
  className?: string;
}

/* ─── Formatting ─────────────────────────────────────────────────────────── */

function formatCellValue(
  value: number | string | null,
  format?: PivotRow["format"]
): string {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  switch (format) {
    case "currency": {
      const abs = Math.abs(value);
      const formatted =
        abs >= 1_000_000
          ? `$${(abs / 1_000_000).toFixed(2)}M`
          : abs >= 10_000
            ? `$${Math.round(abs).toLocaleString("en-US")}`
            : `$${abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      return value < 0 ? `(${formatted})` : formatted;
    }
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
      return typeof value === "number"
        ? value.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: value % 1 !== 0 ? 1 : 0,
          })
        : String(value);
    case "text":
    default:
      return typeof value === "number" ? value.toLocaleString("en-US") : String(value);
  }
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function PivotSummaryRenderer({
  title,
  rowHeaders,
  columnHeaders,
  data,
  rowGrouping,
  showTotals = false,
  totalLabel = "Portfolio Avg",
  className,
}: PivotSummaryRendererProps) {
  const orderedRows = rowGrouping
    ? buildGroupedRows(rowHeaders, rowGrouping)
    : rowHeaders;

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
              {/* Sticky metric label column header */}
              <th className="sticky left-0 z-10 bg-[#faf7f4] text-left py-2.5 pl-4 pr-3 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold min-w-[200px] w-[240px] border-r border-[#e8dfd4]">
                Metric
              </th>
              {columnHeaders.map((col) => (
                <th
                  key={col}
                  className="text-right py-2.5 px-4 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold min-w-[120px] whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
              {showTotals && (
                <th className="text-right py-2.5 px-4 text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold min-w-[130px] whitespace-nowrap border-l border-[#e8dfd4] bg-[#f7f3ef]">
                  {totalLabel}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {orderedRows.map((row) => {
              if (row.isSectionHeader) {
                return (
                  <SectionHeaderRow
                    key={row.key}
                    row={row}
                    colSpan={
                      columnHeaders.length + 1 + (showTotals ? 1 : 0)
                    }
                  />
                );
              }

              return (
                <DataRow
                  key={row.key}
                  row={row}
                  columnHeaders={columnHeaders}
                  data={data}
                  showTotals={showTotals}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Section Header Row ─────────────────────────────────────────────────── */

function SectionHeaderRow({
  row,
  colSpan,
}: {
  row: PivotRow;
  colSpan: number;
}) {
  return (
    <tr className="bg-[#faf7f4] border-t border-[#e8dfd4]">
      <td
        colSpan={colSpan}
        className="py-2 px-4 text-xs font-semibold text-[#1a1510] uppercase tracking-wider"
      >
        {row.label}
      </td>
    </tr>
  );
}

/* ─── Data Row ───────────────────────────────────────────────────────────── */

function DataRow({
  row,
  columnHeaders,
  data,
  showTotals,
}: {
  row: PivotRow;
  columnHeaders: string[];
  data: Record<string, Record<string, number | string | null>>;
  showTotals: boolean;
}) {
  const rowData = data[row.key] ?? {};
  const indent = (row.indent ?? 0) * 16;

  const totalKey = "__total__";
  const totalValue = rowData[totalKey] ?? null;

  return (
    <tr
      className={cn(
        "group transition-colors",
        row.isSubtotal
          ? "font-semibold bg-[#faf7f4] border-t border-[#e8dfd4]"
          : "hover:bg-[#f7f3ef]"
      )}
    >
      {/* Sticky metric label */}
      <td
        className={cn(
          "sticky left-0 z-10 bg-white py-2.5 pr-3 text-sm whitespace-nowrap border-r border-[#e8dfd4]",
          row.isSubtotal
            ? "font-semibold text-[#1a1510] bg-[#faf7f4]"
            : "text-[#1a1510]",
          "group-hover:bg-[#f7f3ef]"
        )}
        style={{ paddingLeft: `${16 + indent}px` }}
      >
        {row.label}
      </td>

      {/* Data cells */}
      {columnHeaders.map((col) => {
        const value = rowData[col] ?? null;
        const isNegative =
          typeof value === "number" && value < 0;
        const isBreach = checkBreach(row, value);

        return (
          <td
            key={col}
            className={cn(
              "py-2.5 px-4 text-sm text-right tabular-nums whitespace-nowrap",
              row.isSubtotal && "font-semibold",
              isBreach
                ? "bg-red-50 text-red-700"
                : isNegative
                  ? "text-red-600"
                  : "text-[#1a1510]"
            )}
          >
            {formatCellValue(value, row.format)}
          </td>
        );
      })}

      {/* Total/Average column */}
      {showTotals && (
        <td
          className={cn(
            "py-2.5 px-4 text-sm text-right tabular-nums whitespace-nowrap border-l border-[#e8dfd4] bg-[#f7f3ef]/50",
            row.isSubtotal && "font-semibold"
          )}
        >
          {formatCellValue(totalValue, row.format)}
        </td>
      )}
    </tr>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function buildGroupedRows(
  allRows: PivotRow[],
  groups: PivotRowGroup[]
): PivotRow[] {
  const result: PivotRow[] = [];
  const rowMap = new Map(allRows.map((r) => [r.key, r]));

  for (const group of groups) {
    result.push({
      key: `__section_${group.label}`,
      label: group.label,
      isSectionHeader: true,
    });
    for (const key of group.rowKeys) {
      const row = rowMap.get(key);
      if (row) result.push(row);
    }
  }

  return result;
}

/**
 * Breach detection for conditional cell coloring.
 * Flags values that are notably underperforming for common metric types.
 */
function checkBreach(
  row: PivotRow,
  value: number | string | null
): boolean {
  if (value == null || typeof value !== "number") return false;

  const key = row.key.toLowerCase();
  if (key.includes("occupancy_rate") && value < 90) return true;
  if (key.includes("delinquency") && value > 5) return true;
  if (key.includes("collections_rate") && value < 95) return true;
  if (key.includes("net_absorption") && value < -5) return true;

  return false;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Lease Trade-out Summary (6 properties + portfolio total)
   ═══════════════════════════════════════════════════════════════════════════ */

const PROPERTIES = [
  "The Meridian",
  "Harbor Point",
  "Liberty Square",
  "Heritage Oaks",
  "Campus View",
  "Skyline Tower",
] as const;

const LEASE_TRADEOUT_COLUMNS = [...PROPERTIES];

const LEASE_TRADEOUT_ROW_GROUPS: PivotRowGroup[] = [
  {
    label: "Occupancy",
    rowKeys: ["total_units", "occupied_units", "occupancy_rate", "leased_pct"],
  },
  {
    label: "Leasing Activity",
    rowKeys: [
      "new_leases",
      "renewals",
      "move_ins",
      "move_outs",
      "net_absorption",
    ],
  },
  {
    label: "Rent Metrics",
    rowKeys: [
      "avg_market_rent",
      "avg_effective_rent",
      "avg_rent_psf",
      "avg_lease_tradeout",
      "tradeout_pct",
      "loss_to_lease_dollar",
      "loss_to_lease_pct",
    ],
  },
  {
    label: "Collections",
    rowKeys: [
      "gross_potential_rent",
      "collections_rate",
      "delinquency_rate",
      "bad_debt_ytd",
    ],
  },
];

const LEASE_TRADEOUT_ROW_HEADERS: PivotRow[] = [
  { key: "total_units", label: "Total Units", format: "number" },
  { key: "occupied_units", label: "Occupied Units", format: "number" },
  { key: "occupancy_rate", label: "Occupancy Rate", format: "percent" },
  { key: "leased_pct", label: "Leased %", format: "percent" },

  { key: "new_leases", label: "New Leases", format: "number" },
  { key: "renewals", label: "Renewals", format: "number" },
  { key: "move_ins", label: "Move-Ins", format: "number" },
  { key: "move_outs", label: "Move-Outs", format: "number" },
  { key: "net_absorption", label: "Net Absorption", format: "number" },

  { key: "avg_market_rent", label: "Avg Market Rent", format: "currency" },
  { key: "avg_effective_rent", label: "Avg Effective Rent", format: "currency" },
  { key: "avg_rent_psf", label: "Avg Rent PSF", format: "currency" },
  { key: "avg_lease_tradeout", label: "Avg Lease Trade-out", format: "currency" },
  { key: "tradeout_pct", label: "Trade-out %", format: "percent" },
  { key: "loss_to_lease_dollar", label: "Loss to Lease $", format: "currency" },
  { key: "loss_to_lease_pct", label: "Loss to Lease %", format: "percent" },

  { key: "gross_potential_rent", label: "Gross Potential Rent", format: "currency" },
  { key: "collections_rate", label: "Collections Rate", format: "percent" },
  { key: "delinquency_rate", label: "Delinquency Rate", format: "percent" },
  { key: "bad_debt_ytd", label: "Bad Debt YTD", format: "currency" },
];

const LEASE_TRADEOUT_DATA: Record<string, Record<string, number | string | null>> = {
  total_units: {
    "The Meridian": 312, "Harbor Point": 248, "Liberty Square": 186,
    "Heritage Oaks": 220, "Campus View": 480, "Skyline Tower": 156,
    __total__: 1602,
  },
  occupied_units: {
    "The Meridian": 298, "Harbor Point": 239, "Liberty Square": 163,
    "Heritage Oaks": 209, "Campus View": 461, "Skyline Tower": 150,
    __total__: 1520,
  },
  occupancy_rate: {
    "The Meridian": 95.5, "Harbor Point": 96.4, "Liberty Square": 87.6,
    "Heritage Oaks": 95.0, "Campus View": 96.0, "Skyline Tower": 96.2,
    __total__: 94.9,
  },
  leased_pct: {
    "The Meridian": 96.8, "Harbor Point": 97.2, "Liberty Square": 89.8,
    "Heritage Oaks": 96.4, "Campus View": 97.5, "Skyline Tower": 97.4,
    __total__: 95.9,
  },

  new_leases: {
    "The Meridian": 18, "Harbor Point": 14, "Liberty Square": 8,
    "Heritage Oaks": 12, "Campus View": 22, "Skyline Tower": 9,
    __total__: 83,
  },
  renewals: {
    "The Meridian": 24, "Harbor Point": 19, "Liberty Square": 11,
    "Heritage Oaks": 16, "Campus View": 28, "Skyline Tower": 12,
    __total__: 110,
  },
  move_ins: {
    "The Meridian": 16, "Harbor Point": 12, "Liberty Square": 6,
    "Heritage Oaks": 11, "Campus View": 20, "Skyline Tower": 8,
    __total__: 73,
  },
  move_outs: {
    "The Meridian": 12, "Harbor Point": 9, "Liberty Square": 14,
    "Heritage Oaks": 10, "Campus View": 15, "Skyline Tower": 6,
    __total__: 66,
  },
  net_absorption: {
    "The Meridian": 4, "Harbor Point": 3, "Liberty Square": -8,
    "Heritage Oaks": 1, "Campus View": 5, "Skyline Tower": 2,
    __total__: 7,
  },

  avg_market_rent: {
    "The Meridian": 1895, "Harbor Point": 2245, "Liberty Square": 1425,
    "Heritage Oaks": 1650, "Campus View": 985, "Skyline Tower": 2480,
    __total__: 1780,
  },
  avg_effective_rent: {
    "The Meridian": 1842, "Harbor Point": 2198, "Liberty Square": 1358,
    "Heritage Oaks": 1612, "Campus View": 962, "Skyline Tower": 2435,
    __total__: 1735,
  },
  avg_rent_psf: {
    "The Meridian": 2.12, "Harbor Point": 2.68, "Liberty Square": 1.58,
    "Heritage Oaks": 1.84, "Campus View": 1.42, "Skyline Tower": 3.15,
    __total__: 2.13,
  },
  avg_lease_tradeout: {
    "The Meridian": 47, "Harbor Point": 62, "Liberty Square": -18,
    "Heritage Oaks": 35, "Campus View": 28, "Skyline Tower": 55,
    __total__: 38,
  },
  tradeout_pct: {
    "The Meridian": 2.6, "Harbor Point": 2.9, "Liberty Square": -1.3,
    "Heritage Oaks": 2.2, "Campus View": 3.0, "Skyline Tower": 2.3,
    __total__: 2.2,
  },
  loss_to_lease_dollar: {
    "The Meridian": -16536, "Harbor Point": -11668, "Liberty Square": -12462,
    "Heritage Oaks": -8360, "Campus View": -11040, "Skyline Tower": -7020,
    __total__: -67086,
  },
  loss_to_lease_pct: {
    "The Meridian": -2.8, "Harbor Point": -2.1, "Liberty Square": -4.7,
    "Heritage Oaks": -2.3, "Campus View": -2.3, "Skyline Tower": -1.8,
    __total__: -2.5,
  },

  gross_potential_rent: {
    "The Meridian": 591240, "Harbor Point": 556760, "Liberty Square": 265050,
    "Heritage Oaks": 363000, "Campus View": 472800, "Skyline Tower": 386880,
    __total__: 2635730,
  },
  collections_rate: {
    "The Meridian": 98.2, "Harbor Point": 98.8, "Liberty Square": 93.4,
    "Heritage Oaks": 97.6, "Campus View": 97.1, "Skyline Tower": 99.1,
    __total__: 97.4,
  },
  delinquency_rate: {
    "The Meridian": 2.1, "Harbor Point": 1.4, "Liberty Square": 7.8,
    "Heritage Oaks": 2.8, "Campus View": 3.2, "Skyline Tower": 1.1,
    __total__: 3.1,
  },
  bad_debt_ytd: {
    "The Meridian": 14280, "Harbor Point": 8640, "Liberty Square": 28350,
    "Heritage Oaks": 11880, "Campus View": 18720, "Skyline Tower": 5460,
    __total__: 87330,
  },
};

export const LEASE_TRADEOUT_SUMMARY_MOCK = {
  title: "Lease Trade-out Summary — Feb 2026",
  rowHeaders: LEASE_TRADEOUT_ROW_HEADERS,
  columnHeaders: LEASE_TRADEOUT_COLUMNS as unknown as string[],
  data: LEASE_TRADEOUT_DATA,
  rowGrouping: LEASE_TRADEOUT_ROW_GROUPS,
  showTotals: true,
  totalLabel: "Portfolio Total/Avg",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Executive Summary / Property Pulse (time-comparison view)
   ═══════════════════════════════════════════════════════════════════════════ */

const EXEC_SUMMARY_COLUMNS = [
  "Current Month",
  "Prior Month",
  "Variance",
  "YTD",
  "Budget YTD",
  "YTD Variance",
];

const EXEC_SUMMARY_ROW_GROUPS: PivotRowGroup[] = [
  {
    label: "Portfolio Health",
    rowKeys: [
      "properties_managed",
      "exec_total_units",
      "portfolio_occupancy",
      "portfolio_leased",
    ],
  },
  {
    label: "Revenue",
    rowKeys: [
      "exec_gpr",
      "exec_nri",
      "exec_other_income",
      "exec_egi",
    ],
  },
  {
    label: "Expenses",
    rowKeys: [
      "exec_total_opex",
      "exec_expense_per_unit",
      "exec_expense_ratio",
    ],
  },
  {
    label: "NOI",
    rowKeys: [
      "exec_noi",
      "exec_noi_margin",
      "exec_noi_per_unit",
      "exec_noi_vs_budget",
    ],
  },
  {
    label: "AI Impact",
    rowKeys: [
      "active_ai_conversations",
      "ai_hours_saved",
      "ai_cost_savings",
      "ai_escalation_rate",
    ],
  },
];

const EXEC_SUMMARY_ROW_HEADERS: PivotRow[] = [
  { key: "properties_managed", label: "Properties Managed", format: "number" },
  { key: "exec_total_units", label: "Total Units", format: "number" },
  { key: "portfolio_occupancy", label: "Portfolio Occupancy", format: "percent" },
  { key: "portfolio_leased", label: "Portfolio Leased", format: "percent" },

  { key: "exec_gpr", label: "Gross Potential Rent", format: "currency" },
  { key: "exec_nri", label: "Net Rental Income", format: "currency" },
  { key: "exec_other_income", label: "Other Income", format: "currency" },
  { key: "exec_egi", label: "Effective Gross Income", format: "currency", isSubtotal: true },

  { key: "exec_total_opex", label: "Total Operating Expenses", format: "currency" },
  { key: "exec_expense_per_unit", label: "Expense Per Unit", format: "currency" },
  { key: "exec_expense_ratio", label: "Expense Ratio", format: "percent" },

  { key: "exec_noi", label: "Net Operating Income", format: "currency", isSubtotal: true },
  { key: "exec_noi_margin", label: "NOI Margin", format: "percent" },
  { key: "exec_noi_per_unit", label: "NOI Per Unit", format: "currency" },
  { key: "exec_noi_vs_budget", label: "NOI vs Budget", format: "percent" },

  { key: "active_ai_conversations", label: "Active AI Conversations", format: "number" },
  { key: "ai_hours_saved", label: "AI Hours Saved", format: "number" },
  { key: "ai_cost_savings", label: "AI Cost Savings", format: "currency" },
  { key: "ai_escalation_rate", label: "AI Escalation Rate", format: "percent" },
];

const EXEC_SUMMARY_DATA: Record<string, Record<string, number | string | null>> = {
  properties_managed: {
    "Current Month": 12, "Prior Month": 12, "Variance": 0,
    YTD: 12, "Budget YTD": 12, "YTD Variance": 0,
  },
  exec_total_units: {
    "Current Month": 2974, "Prior Month": 2974, "Variance": 0,
    YTD: 2974, "Budget YTD": 2974, "YTD Variance": 0,
  },
  portfolio_occupancy: {
    "Current Month": 94.9, "Prior Month": 94.2, "Variance": 0.7,
    YTD: 94.6, "Budget YTD": 95.0, "YTD Variance": -0.4,
  },
  portfolio_leased: {
    "Current Month": 96.1, "Prior Month": 95.4, "Variance": 0.7,
    YTD: 95.8, "Budget YTD": 96.0, "YTD Variance": -0.2,
  },

  exec_gpr: {
    "Current Month": 5284200, "Prior Month": 5284200, "Variance": 0,
    YTD: 10568400, "Budget YTD": 10620000, "YTD Variance": -51600,
  },
  exec_nri: {
    "Current Month": 4856640, "Prior Month": 4791280, "Variance": 65360,
    YTD: 9647920, "Budget YTD": 9708000, "YTD Variance": -60080,
  },
  exec_other_income: {
    "Current Month": 356400, "Prior Month": 342100, "Variance": 14300,
    YTD: 698500, "Budget YTD": 684000, "YTD Variance": 14500,
  },
  exec_egi: {
    "Current Month": 5213040, "Prior Month": 5133380, "Variance": 79660,
    YTD: 10346420, "Budget YTD": 10392000, "YTD Variance": -45580,
  },

  exec_total_opex: {
    "Current Month": 2158920, "Prior Month": 2204360, "Variance": -45440,
    YTD: 4363280, "Budget YTD": 4320000, "YTD Variance": 43280,
  },
  exec_expense_per_unit: {
    "Current Month": 726, "Prior Month": 741, "Variance": -15,
    YTD: 1467, "Budget YTD": 1453, "YTD Variance": 14,
  },
  exec_expense_ratio: {
    "Current Month": 41.4, "Prior Month": 42.9, "Variance": -1.5,
    YTD: 42.2, "Budget YTD": 41.6, "YTD Variance": 0.6,
  },

  exec_noi: {
    "Current Month": 3054120, "Prior Month": 2929020, "Variance": 125100,
    YTD: 5983140, "Budget YTD": 6072000, "YTD Variance": -88860,
  },
  exec_noi_margin: {
    "Current Month": 58.6, "Prior Month": 57.1, "Variance": 1.5,
    YTD: 57.8, "Budget YTD": 58.4, "YTD Variance": -0.6,
  },
  exec_noi_per_unit: {
    "Current Month": 1027, "Prior Month": 985, "Variance": 42,
    YTD: 2012, "Budget YTD": 2042, "YTD Variance": -30,
  },
  exec_noi_vs_budget: {
    "Current Month": 100.3, "Prior Month": 96.2, "Variance": 4.1,
    YTD: 98.5, "Budget YTD": 100.0, "YTD Variance": -1.5,
  },

  active_ai_conversations: {
    "Current Month": 3842, "Prior Month": 3156, "Variance": 686,
    YTD: 6998, "Budget YTD": null, "YTD Variance": null,
  },
  ai_hours_saved: {
    "Current Month": 1284, "Prior Month": 1068, "Variance": 216,
    YTD: 2352, "Budget YTD": null, "YTD Variance": null,
  },
  ai_cost_savings: {
    "Current Month": 48150, "Prior Month": 40050, "Variance": 8100,
    YTD: 88200, "Budget YTD": null, "YTD Variance": null,
  },
  ai_escalation_rate: {
    "Current Month": 6.2, "Prior Month": 7.8, "Variance": -1.6,
    YTD: 7.0, "Budget YTD": null, "YTD Variance": null,
  },
};

export const EXECUTIVE_SUMMARY_MOCK = {
  title: "Executive Summary — Portfolio Pulse, Feb 2026",
  rowHeaders: EXEC_SUMMARY_ROW_HEADERS,
  columnHeaders: EXEC_SUMMARY_COLUMNS,
  data: EXEC_SUMMARY_DATA,
  rowGrouping: EXEC_SUMMARY_ROW_GROUPS,
  showTotals: false,
  totalLabel: "Portfolio Total/Avg",
};
