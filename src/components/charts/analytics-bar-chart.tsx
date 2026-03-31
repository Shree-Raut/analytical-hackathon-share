"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarConfig {
  key: string;
  color: string;
  label: string;
}

interface AnalyticsBarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  bars: BarConfig[];
  height?: number;
  stacked?: boolean;
  className?: string;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#e8dfd4] bg-white px-3 py-2 shadow-lg">
      <div className="text-[11px] text-[#7d654e] mb-1">{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#7d654e]">{entry.name}</span>
          <span className="text-[#1a1510] font-medium ml-auto tabular-nums">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsBarChart({
  data,
  xKey,
  bars,
  height = 300,
  stacked = false,
  className,
}: AnalyticsBarChartProps) {
  const stackId = stacked ? "stack" : undefined;

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#7d654e" }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#7d654e" }}
            dx={-4}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(125,101,78,0.04)" }}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color}
              stackId={stackId}
              radius={stacked ? 0 : [3, 3, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
