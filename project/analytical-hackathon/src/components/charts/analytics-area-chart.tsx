"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface AreaConfig {
  key: string;
  color: string;
  label: string;
}

interface AnalyticsAreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  areas: AreaConfig[];
  height?: number;
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

export function AnalyticsAreaChart({
  data,
  xKey,
  areas,
  height = 300,
  className,
}: AnalyticsAreaChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={area.key}
                id={`fill-${area.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={area.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#e8dfd4" }} />
          {areas.map((area) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.label}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#fill-${area.key})`}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
