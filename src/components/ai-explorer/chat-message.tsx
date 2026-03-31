"use client";

import { AnalyticsLineChart } from "@/components/charts/analytics-line-chart";
import { AnalyticsBarChart } from "@/components/charts/analytics-bar-chart";
import { AnalyticsAreaChart } from "@/components/charts/analytics-area-chart";
import { Pin, Bookmark } from "lucide-react";

export interface ChartConfig {
  type: "line" | "bar" | "area";
  data: Array<Record<string, any>>;
  config: any;
}

export interface MessageMetadata {
  metrics: string[];
  filters: string;
  freshness: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  chart?: ChartConfig;
  metadata?: MessageMetadata;
  onPin?: () => void;
  onSave?: () => void;
}

export function ChatMessage({
  role,
  content,
  chart,
  metadata,
  onPin,
  onSave,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[92%] rounded-xl px-4 py-3 ${
          role === "user"
            ? "bg-[#7d654e]/10 text-[#1a1510]"
            : "bg-[#faf7f4] border border-[#e8dfd4] text-[#1a1510]"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {content}
        </div>

        {chart && (
          <div className="mt-3 -mx-1">
            {chart.type === "line" && (
              <AnalyticsLineChart
                data={chart.data}
                xKey={chart.config.xKey}
                lines={chart.config.lines}
                height={180}
              />
            )}
            {chart.type === "bar" && (
              <AnalyticsBarChart
                data={chart.data}
                xKey={chart.config.xKey}
                bars={chart.config.bars}
                height={180}
              />
            )}
            {chart.type === "area" && (
              <AnalyticsAreaChart
                data={chart.data}
                xKey={chart.config.xKey}
                areas={chart.config.areas}
                height={180}
              />
            )}
          </div>
        )}

        {metadata && role === "assistant" && (
          <div className="text-[10px] text-[#7d654e]/60 border-t border-[#e8dfd4] mt-2 pt-2">
            Using: {metadata.metrics.join(", ")} | Filters:{" "}
            {metadata.filters} | Data as of: {metadata.freshness}
          </div>
        )}

        {role === "assistant" && (onPin || onSave) && (
          <div className="flex gap-2 mt-2">
            {onPin && (
              <button
                onClick={onPin}
                className="flex items-center gap-1 text-[11px] text-[#7d654e] hover:text-[#1a1510] border border-[#e8dfd4] hover:border-[#7d654e]/40 rounded-md px-2 py-0.5 transition-colors"
              >
                <Pin size={10} />
                Pin
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-1 text-[11px] text-[#7d654e] hover:text-[#1a1510] border border-[#e8dfd4] hover:border-[#7d654e]/40 rounded-md px-2 py-0.5 transition-colors"
              >
                <Bookmark size={10} />
                Save
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
