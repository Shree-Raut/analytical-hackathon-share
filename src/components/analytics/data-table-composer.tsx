"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Columns3,
  BarChart3,
  X,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SourceBadge } from "@/components/analytics/source-badge";
import { MetricHeader, type MetricInfo } from "@/components/analytics/metric-popover";

export interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
  format?: "currency" | "percent" | "number" | "text" | "date";
  align?: "left" | "right";
  width?: string;
  sortable?: boolean;
}

export interface DataTableComposerProps {
  columns: ColumnDef[];
  data: Record<string, any>[];
  groupBy?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onColumnToggle?: (key: string) => void;
  onGroupByChange?: (key: string | null) => void;
  onSortChange?: (key: string) => void;
  onColumnRename?: (key: string, newLabel: string) => void;
  showColumnPicker?: boolean;
  showGroupBy?: boolean;
  showChartToggle?: boolean;
  className?: string;
  sourceSystems?: Record<string, string>;
  metricDefinitions?: Record<string, MetricInfo>;
}

function formatCell(
  value: any,
  format?: ColumnDef["format"],
  percentAsDecimal = false,
): string {
  if (value == null || value === "") return "—";
  switch (format) {
    case "currency":
      if (typeof value !== "number") return String(value);
      return value < 0
        ? `-$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "percent":
      if (typeof value !== "number") return String(value);
      return `${(percentAsDecimal ? value * 100 : value).toFixed(1)}%`;
    case "number":
      if (typeof value !== "number") return String(value);
      return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
    case "date":
      if (value instanceof Date) {
        return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
      }
      return String(value);
    default:
      return String(value);
  }
}

function InlineEditor({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <span
        onDoubleClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="cursor-text"
        title="Double-click to rename"
      >
        {value}
      </span>
    );
  }

  function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== value) {
      onSave(draft.trim());
    }
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setEditing(false);
      }}
      className="bg-white border border-[#e8dfd4] rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-[#7d654e] w-full outline-none focus:border-[#7d654e]"
    />
  );
}

export function DataTableComposer({
  columns,
  data,
  groupBy,
  sortBy,
  sortDir = "asc",
  onColumnToggle,
  onGroupByChange,
  onSortChange,
  onColumnRename,
  showColumnPicker = false,
  showGroupBy = false,
  showChartToggle = false,
  className,
  sourceSystems,
  metricDefinitions,
}: DataTableComposerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [internalSortBy, setInternalSortBy] = useState(sortBy ?? null);
  const [internalSortDir, setInternalSortDir] = useState(sortDir);

  const activeSortBy = sortBy ?? internalSortBy;
  const activeSortDir = sortDir ?? internalSortDir;

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns],
  );
  const percentColumnsAsDecimal = useMemo(() => {
    const decimalKeys = new Set<string>();
    for (const col of columns) {
      if (col.format !== "percent") continue;
      const numericVals = data
        .map((row) => row[col.key])
        .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
      if (
        numericVals.length > 0 &&
        numericVals.every((v) => v >= 0 && v <= 1)
      ) {
        decimalKeys.add(col.key);
      }
    }
    return decimalKeys;
  }, [columns, data]);
  const formatValue = useCallback(
    (value: any, col: ColumnDef) =>
      formatCell(value, col.format, percentColumnsAsDecimal.has(col.key)),
    [percentColumnsAsDecimal],
  );

  const handleSort = useCallback(
    (key: string) => {
      if (onSortChange) {
        onSortChange(key);
      } else {
        if (internalSortBy === key) {
          setInternalSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
          setInternalSortBy(key);
          setInternalSortDir("asc");
        }
      }
    },
    [onSortChange, internalSortBy],
  );

  const sortedData = useMemo(() => {
    if (!activeSortBy) return data;
    return [...data].sort((a, b) => {
      const aVal = a[activeSortBy];
      const bVal = b[activeSortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return activeSortDir === "asc" ? cmp : -cmp;
    });
  }, [data, activeSortBy, activeSortDir]);

  const groupedData = useMemo(() => {
    if (!groupBy) return null;

    const groups = new Map<string, Record<string, any>[]>();
    for (const row of sortedData) {
      const key = String(row[groupBy] ?? "Ungrouped");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    return Array.from(groups.entries()).map(([key, rows]) => {
      const subtotals: Record<string, any> = { __isSubtotal: true };

      for (const col of visibleColumns) {
        if (col.key === groupBy) {
          subtotals[col.key] = `${key} Total`;
          continue;
        }
        const vals = rows.map((r) => r[col.key]).filter((v) => typeof v === "number");
        if (vals.length === 0) {
          subtotals[col.key] = col.format === "text" || !col.format ? rows.length : "—";
          continue;
        }
        if (col.format === "percent") {
          subtotals[col.key] = vals.reduce((a, b) => a + b, 0) / vals.length;
        } else {
          subtotals[col.key] = vals.reduce((a, b) => a + b, 0);
        }
      }

      return { key, rows, subtotals };
    });
  }, [groupBy, sortedData, visibleColumns]);

  const chartData = useMemo(() => {
    if (!chartVisible) return [];
    const textCol = visibleColumns.find(
      (c) => c.format === "text" || c.format === undefined,
    );
    const numCol = visibleColumns.find(
      (c) =>
        c.format === "currency" ||
        c.format === "number" ||
        c.format === "percent",
    );
    if (!textCol || !numCol) return [];

    return sortedData.slice(0, 20).map((row) => ({
      name:
        String(row[textCol.key]).length > 16
          ? String(row[textCol.key]).slice(0, 14) + "…"
          : String(row[textCol.key]),
      value:
        typeof row[numCol.key] === "number"
          ? numCol.format === "percent" &&
            percentColumnsAsDecimal.has(numCol.key)
            ? row[numCol.key] * 100
            : row[numCol.key]
          : 0,
      _label: numCol.label,
      _format: numCol.format,
    }));
  }, [chartVisible, sortedData, visibleColumns, percentColumnsAsDecimal]);

  const columnCategories = useMemo(() => {
    const cats = new Map<string, ColumnDef[]>();
    for (const col of columns) {
      const category = col.format === "currency"
        ? "Financial"
        : col.format === "percent"
          ? "Rates"
          : col.format === "number"
            ? "Counts"
            : "General";
      if (!cats.has(category)) cats.set(category, []);
      cats.get(category)!.push(col);
    }
    return cats;
  }, [columns]);

  return (
    <div className={cn("relative", className)}>
      {/* Toolbar */}
      {(showColumnPicker || showChartToggle || showGroupBy) && (
        <div className="flex items-center gap-2 mb-3">
          {showColumnPicker && (
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                pickerOpen
                  ? "bg-[#7d654e] text-white border-[#7d654e]"
                  : "bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef]",
              )}
            >
              <Columns3 size={13} />
              Columns
            </button>
          )}
          {showChartToggle && (
            <button
              type="button"
              onClick={() => setChartVisible((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                chartVisible
                  ? "bg-[#7d654e] text-white border-[#7d654e]"
                  : "bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef]",
              )}
            >
              <BarChart3 size={13} />
              Chart
            </button>
          )}
        </div>
      )}

      {/* Chart */}
      {chartVisible && chartData.length > 0 && (
        <div className="mb-4 rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e9e0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#7d654e" }}
                axisLine={{ stroke: "#e8dfd4" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#7d654e" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  chartData[0]?._format === "currency"
                    ? `$${(v / 1000).toFixed(0)}k`
                    : chartData[0]?._format === "percent"
                      ? `${v}%`
                      : v.toLocaleString()
                }
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e8dfd4",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#1a1510",
                }}
                formatter={(value) => {
                  const v = Number(value);
                  const formatted = chartData[0]?._format === "currency"
                    ? `$${v.toLocaleString()}`
                    : chartData[0]?._format === "percent"
                      ? `${v.toFixed(1)}%`
                      : v.toLocaleString();
                  return [formatted, chartData[0]?._label ?? "Value"];
                }}
              />
              <Bar dataKey="value" fill="#7d654e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex gap-0">
        {/* Table */}
        <div className="flex-1 min-w-0 overflow-x-auto rounded-xl border border-[#e8dfd4] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-[#faf7f4]">
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "text-[10px] uppercase tracking-wider text-[#7d654e] font-semibold px-4 py-3",
                      col.align === "right" ? "text-right" : "text-left",
                      col.sortable !== false &&
                        "cursor-pointer select-none hover:text-[#1a1510] transition-colors",
                    )}
                    onClick={() =>
                      col.sortable !== false && handleSort(col.key)
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {metricDefinitions?.[col.key] ? (
                        <MetricHeader label={col.label} metric={metricDefinitions[col.key]}>
                          {onColumnRename ? (
                            <InlineEditor
                              value={col.label}
                              onSave={(v) => onColumnRename(col.key, v)}
                            />
                          ) : (
                            col.label
                          )}
                        </MetricHeader>
                      ) : onColumnRename ? (
                        <InlineEditor
                          value={col.label}
                          onSave={(v) => onColumnRename(col.key, v)}
                        />
                      ) : (
                        col.label
                      )}
                      {sourceSystems?.[col.key] && (
                        <SourceBadge source={sourceSystems[col.key]} />
                      )}
                      {col.sortable !== false && (
                        <span className="inline-flex flex-col">
                          {activeSortBy === col.key ? (
                            activeSortDir === "asc" ? (
                              <ChevronUp size={10} />
                            ) : (
                              <ChevronDown size={10} />
                            )
                          ) : (
                            <ChevronsUpDown size={10} className="opacity-30" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9e0]">
              {groupedData
                ? groupedData.map((group) => (
                    <GroupRows
                      key={group.key}
                      group={group}
                      visibleColumns={visibleColumns}
                      formatValue={formatValue}
                    />
                  ))
                : sortedData.map((row, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-[#f7f3ef]"
                    >
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "text-sm text-[#1a1510] px-4 py-3 tabular-nums",
                            col.align === "right" && "text-right",
                          )}
                        >
                          {formatValue(row[col.key], col)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="py-12 text-center text-sm text-[#7d654e]">
              No data available
            </div>
          )}
        </div>

        {/* Column Picker Sidebar */}
        {pickerOpen && (
          <div className="w-56 ml-3 shrink-0 bg-white border border-[#e8dfd4] rounded-xl shadow-lg p-4 self-start max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#1a1510]">
                Columns
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-[#7d654e] hover:text-[#1a1510] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            {Array.from(columnCategories.entries()).map(([cat, cols]) => (
              <div key={cat} className="mb-3">
                <div className="text-[9px] uppercase tracking-wider text-[#7d654e]/60 font-semibold mb-1.5">
                  {cat}
                </div>
                {cols.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 py-1 cursor-pointer group"
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        col.visible
                          ? "bg-[#7d654e] border-[#7d654e]"
                          : "border-[#e8dfd4] group-hover:border-[#7d654e]/50",
                      )}
                      onClick={() => onColumnToggle?.(col.key)}
                    >
                      {col.visible && (
                        <Check size={10} className="text-white" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-xs transition-colors",
                        col.visible ? "text-[#1a1510]" : "text-[#7d654e]",
                      )}
                      onClick={() => onColumnToggle?.(col.key)}
                    >
                      {col.label}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupRows({
  group,
  visibleColumns,
  formatValue,
}: {
  group: { key: string; rows: Record<string, any>[]; subtotals: Record<string, any> };
  visibleColumns: ColumnDef[];
  formatValue: (value: any, col: ColumnDef) => string;
}) {
  return (
    <>
      {/* Group header */}
      <tr className="bg-[#f7f3ef]">
        <td
          colSpan={visibleColumns.length}
          className="px-4 py-2.5 text-sm font-semibold text-[#1a1510]"
        >
          {group.key}
          <span className="ml-2 text-xs font-normal text-[#7d654e]">
            ({group.rows.length} {group.rows.length === 1 ? "row" : "rows"})
          </span>
        </td>
      </tr>
      {/* Rows */}
      {group.rows.map((row, i) => (
        <tr key={i} className="transition-colors hover:bg-[#f7f3ef]">
          {visibleColumns.map((col) => (
            <td
              key={col.key}
              className={cn(
                "text-sm text-[#1a1510] px-4 py-3 tabular-nums",
                col.align === "right" && "text-right",
              )}
            >
              {formatValue(row[col.key], col)}
            </td>
          ))}
        </tr>
      ))}
      {/* Subtotal */}
      <tr className="bg-[#faf7f4] border-t border-[#e8dfd4]">
        {visibleColumns.map((col) => (
          <td
            key={col.key}
            className={cn(
              "text-sm font-semibold text-[#7d654e] px-4 py-2.5 tabular-nums",
              col.align === "right" && "text-right",
            )}
          >
            {formatValue(group.subtotals[col.key], col)}
          </td>
        ))}
      </tr>
    </>
  );
}
