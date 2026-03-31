"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface ColumnDef {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: "currency" | "percent" | "number";
}

interface AnalyticsTableProps {
  columns: ColumnDef[];
  data: Array<Record<string, any>>;
  sortable?: boolean;
  className?: string;
}

function formatCell(value: any, format?: ColumnDef["format"]) {
  if (value == null) return "—";
  if (typeof value !== "number") return String(value);
  switch (format) {
    case "currency":
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
      return value.toLocaleString();
    default:
      return String(value);
  }
}

export function AnalyticsTable({
  columns,
  data,
  sortable = false,
  className,
}: AnalyticsTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-[#e8dfd4] bg-white shadow-sm", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-[#faf7f4]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-[10px] uppercase tracking-wider text-[#7d654e] font-semibold pb-3 pt-3 px-3",
                  col.align === "right" ? "text-right" : "text-left",
                  sortable && "cursor-pointer select-none hover:text-[#1a1510] transition-colors"
                )}
                onClick={() => handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortable && (
                    <span className="inline-flex flex-col">
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
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
          {sorted.map((row, i) => (
            <tr
              key={i}
              className="transition-colors hover:bg-[#f7f3ef]"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "text-sm text-[#1a1510] py-2.5 px-3 tabular-nums",
                    col.align === "right" && "text-right"
                  )}
                >
                  {formatCell(row[col.key], col.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
