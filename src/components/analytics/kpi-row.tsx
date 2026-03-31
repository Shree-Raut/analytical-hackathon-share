import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiItem {
  label: string;
  value: string | number;
  trend?: number;
  format?: "currency" | "percent" | "number";
}

interface KpiRowProps {
  items: KpiItem[];
  className?: string;
}

function formatValue(value: string | number, format?: KpiItem["format"]) {
  if (typeof value === "string") return value;
  switch (format) {
    case "currency":
      return value >= 1_000_000
        ? `$${(value / 1_000_000).toFixed(1)}M`
        : value >= 1_000
          ? `$${(value / 1_000).toFixed(1)}K`
          : `$${value.toLocaleString()}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
    default:
      return value.toLocaleString();
  }
}

export function KpiRow({ items, className }: KpiRowProps) {
  return (
    <div className={cn("flex items-baseline gap-8", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1a1510] tabular-nums">
              {formatValue(item.value, item.format)}
            </span>
            {item.trend != null && item.trend !== 0 && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  item.trend > 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {item.trend > 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {Math.abs(item.trend).toFixed(1)}%
              </span>
            )}
          </div>
          <span className="text-sm text-[#7d654e] mt-0.5">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
