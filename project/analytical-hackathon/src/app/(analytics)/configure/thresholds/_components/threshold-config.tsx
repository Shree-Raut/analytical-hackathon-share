"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Target,
  BarChart3,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface AlertRule {
  id: string;
  metricName: string;
  metricFormat: string;
  alertType: string;
  severity: string;
  isActive: boolean;
  channels: string[];
  config: Record<string, any>;
  currentValue: number | null;
  hasActiveAlert: boolean;
  activeAlertSeverity: string | null;
}

interface Threshold {
  id: string;
  metricName: string;
  metricFormat: string;
  greenThreshold: number | null;
  yellowThreshold: number | null;
  redThreshold: number | null;
  priority: number;
  isActive: boolean;
  currentValue: number | null;
  dimensionFilters: string;
}

const ALERT_TYPE_META: Record<string, { icon: typeof AlertTriangle; color: string; label: string }> = {
  THRESHOLD: { icon: Target, color: "text-rose-500", label: "Threshold breach" },
  VARIANCE: { icon: BarChart3, color: "text-amber-600", label: "Budget/period variance" },
  TREND: { icon: TrendingUp, color: "text-blue-500", label: "Trending anomaly" },
  ANOMALY: { icon: Zap, color: "text-purple-500", label: "Statistical anomaly" },
  PREDICTIVE: { icon: TrendingUp, color: "text-cyan-600", label: "Predictive alert" },
};

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "text-rose-600 bg-rose-50 border-rose-200",
  WARNING: "text-amber-600 bg-amber-50 border-amber-200",
  INFO: "text-blue-600 bg-blue-50 border-blue-200",
};

function formatValue(value: number | null, format: string): string {
  if (value == null) return "—";
  switch (format) {
    case "percent": return `${value.toFixed(1)}%`;
    case "currency": return value >= 1_000 ? `$${(value / 1_000).toFixed(1)}K` : `$${value.toFixed(0)}`;
    case "days": return `${value.toFixed(1)}d`;
    default: return Math.round(value).toLocaleString();
  }
}

function getHealthColor(
  current: number | null,
  green: number | null,
  yellow: number | null,
  red: number | null,
  format: string
): "green" | "yellow" | "red" | "unknown" {
  if (current == null) return "unknown";
  const isHigherBetter = format === "percent" || format === "currency";
  if (isHigherBetter) {
    if (green != null && current >= green) return "green";
    if (yellow != null && current >= yellow) return "yellow";
    return "red";
  } else {
    if (green != null && current <= green) return "green";
    if (yellow != null && current <= yellow) return "yellow";
    return "red";
  }
}

function ThresholdGauge({ current, green, yellow, red, format }: {
  current: number | null;
  green: number | null;
  yellow: number | null;
  red: number | null;
  format: string;
}) {
  if (green == null && yellow == null && red == null) return null;

  const values = [green, yellow, red].filter((v): v is number => v != null);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.1;
  const range = max - min || 1;

  function toPercent(v: number) {
    return Math.max(0, Math.min(100, ((v - min) / range) * 100));
  }

  const health = getHealthColor(current, green, yellow, red, format);
  const currentPos = current != null ? toPercent(current) : null;

  return (
    <div className="mt-3">
      <div className="relative h-3 bg-[#f0e9e0] rounded-full overflow-hidden">
        {red != null && (
          <div
            className="absolute top-0 h-full bg-rose-200 rounded-full"
            style={{ left: 0, width: `${toPercent(red)}%` }}
          />
        )}
        {yellow != null && (
          <div
            className="absolute top-0 h-full bg-amber-200 rounded-full"
            style={{ left: 0, width: `${toPercent(yellow)}%` }}
          />
        )}
        {green != null && (
          <div
            className="absolute top-0 h-full bg-emerald-200 rounded-full"
            style={{ left: 0, width: `${toPercent(green)}%` }}
          />
        )}
        {currentPos != null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
            style={{
              left: `${currentPos}%`,
              transform: `translate(-50%, -50%)`,
              backgroundColor: health === "green" ? "#10b981" : health === "yellow" ? "#f59e0b" : health === "red" ? "#ef4444" : "#94a3b8",
            }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-[#7d654e]/60">
        {red != null && <span className="text-rose-500">Red: {formatValue(red, format)}</span>}
        {yellow != null && <span className="text-amber-500">Yellow: {formatValue(yellow, format)}</span>}
        {green != null && <span className="text-emerald-600">Green: {formatValue(green, format)}</span>}
      </div>
    </div>
  );
}

export function ThresholdConfig({ rules, thresholds }: { rules: AlertRule[]; thresholds: Threshold[] }) {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [expandedThreshold, setExpandedThreshold] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Alert Rules */}
      <section>
        <h2 className="text-sm font-semibold text-[#1a1510] mb-1">Active Alert Rules</h2>
        <p className="text-xs text-[#7d654e]/60 mb-4">{rules.length} rules configured — click a rule to see details and current status</p>

        {rules.length > 0 ? (
          <div className="space-y-2">
            {rules.map((rule) => {
              const typeMeta = ALERT_TYPE_META[rule.alertType] ?? ALERT_TYPE_META.THRESHOLD;
              const Icon = typeMeta.icon;
              const isExpanded = expandedRule === rule.id;

              return (
                <div key={rule.id} className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f3ef] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-[200px]">
                      {isExpanded ? <ChevronDown size={14} className="text-[#7d654e]" /> : <ChevronRight size={14} className="text-[#7d654e]" />}
                      <span className="text-sm font-medium text-[#1a1510]">{rule.metricName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon size={13} className={typeMeta.color} />
                      <span className="text-xs text-[#7d654e]">{rule.alertType}</span>
                    </div>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", SEVERITY_STYLES[rule.severity] ?? SEVERITY_STYLES.WARNING)}>
                      {rule.severity}
                    </span>
                    <div className="flex gap-1 ml-auto">
                      {rule.channels.map((ch) => (
                        <span key={ch} className="text-[10px] text-[#7d654e] bg-[#f7f3ef] border border-[#e8dfd4] rounded px-1.5 py-0.5">{ch.replace("_", " ")}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 ml-4">
                      <span className={cn("w-2 h-2 rounded-full", rule.isActive ? "bg-emerald-500" : "bg-[#7d654e]/40")} />
                      <span className="text-xs text-[#7d654e]">{rule.isActive ? "Active" : "Inactive"}</span>
                    </div>
                    {rule.hasActiveAlert && (
                      <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 border-t border-[#f0e9e0] bg-[#faf7f4]">
                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-[#7d654e]/60 mb-1">Alert Type</div>
                          <div className="text-[#1a1510] font-medium">{typeMeta.label}</div>
                          <div className="text-xs text-[#7d654e] mt-0.5">Fires when the metric crosses the configured threshold</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-[#7d654e]/60 mb-1">Current Portfolio Value</div>
                          <div className={cn("text-lg font-bold tabular-nums", rule.hasActiveAlert ? "text-red-600" : "text-[#1a1510]")}>
                            {formatValue(rule.currentValue, rule.metricFormat)}
                          </div>
                          {rule.hasActiveAlert && (
                            <div className="text-xs text-red-600 mt-0.5 font-medium">Alert active — {rule.activeAlertSeverity}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-[#7d654e]/60 mb-1">Configuration</div>
                          {Object.keys(rule.config).length > 0 ? (
                            <div className="space-y-1">
                              {Object.entries(rule.config).map(([k, v]) => (
                                <div key={k} className="text-xs">
                                  <span className="text-[#7d654e]">{k}:</span>{" "}
                                  <span className="text-[#1a1510] font-mono">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-[#7d654e]">Default configuration</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-[#e8dfd4] bg-white p-8 text-center shadow-sm">
            <AlertTriangle size={24} className="text-[#7d654e]/60 mx-auto mb-2" />
            <p className="text-sm text-[#7d654e]/60">No alert rules configured.</p>
          </div>
        )}
      </section>

      {/* Threshold Configuration */}
      <section>
        <h2 className="text-sm font-semibold text-[#1a1510] mb-1">Threshold Configuration</h2>
        <p className="text-xs text-[#7d654e]/60 mb-4">Green / Yellow / Red ranges by metric — click to see how your current values compare</p>

        {thresholds.length > 0 ? (
          <div className="space-y-2">
            {thresholds.map((t) => {
              const isExpanded = expandedThreshold === t.id;
              const health = getHealthColor(t.currentValue, t.greenThreshold, t.yellowThreshold, t.redThreshold, t.metricFormat);
              const healthDot = health === "green" ? "bg-emerald-500" : health === "yellow" ? "bg-amber-500" : health === "red" ? "bg-red-500" : "bg-[#7d654e]/40";

              return (
                <div key={t.id} className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedThreshold(isExpanded ? null : t.id)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7f3ef] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-[200px]">
                      {isExpanded ? <ChevronDown size={14} className="text-[#7d654e]" /> : <ChevronRight size={14} className="text-[#7d654e]" />}
                      <span className="text-sm font-medium text-[#1a1510]">{t.metricName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-emerald-600">{formatValue(t.greenThreshold, t.metricFormat)}</span>
                      <span className="text-[#e8dfd4]">/</span>
                      <span className="text-xs font-mono text-amber-600">{formatValue(t.yellowThreshold, t.metricFormat)}</span>
                      <span className="text-[#e8dfd4]">/</span>
                      <span className="text-xs font-mono text-rose-500">{formatValue(t.redThreshold, t.metricFormat)}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className={cn("w-2.5 h-2.5 rounded-full", healthDot)} />
                      <span className="text-sm font-mono font-semibold text-[#1a1510]">
                        {formatValue(t.currentValue, t.metricFormat)}
                      </span>
                      <span className="text-xs text-[#7d654e]">current</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#f0e9e0] bg-[#faf7f4]">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="bg-white rounded-lg border border-[#e8dfd4] p-3 text-center">
                          <div className="text-[10px] uppercase tracking-wider text-[#7d654e]/60 mb-1">Current</div>
                          <div className={cn("text-xl font-bold tabular-nums", health === "red" ? "text-red-600" : health === "yellow" ? "text-amber-600" : "text-emerald-600")}>
                            {formatValue(t.currentValue, t.metricFormat)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border border-emerald-200 p-3 text-center">
                          <div className="text-[10px] uppercase tracking-wider text-emerald-600/60 mb-1">Green (healthy)</div>
                          <div className="text-xl font-bold tabular-nums text-emerald-600">
                            {formatValue(t.greenThreshold, t.metricFormat)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border border-amber-200 p-3 text-center">
                          <div className="text-[10px] uppercase tracking-wider text-amber-600/60 mb-1">Yellow (watch)</div>
                          <div className="text-xl font-bold tabular-nums text-amber-600">
                            {formatValue(t.yellowThreshold, t.metricFormat)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border border-rose-200 p-3 text-center">
                          <div className="text-[10px] uppercase tracking-wider text-rose-500/60 mb-1">Red (alert)</div>
                          <div className="text-xl font-bold tabular-nums text-rose-500">
                            {formatValue(t.redThreshold, t.metricFormat)}
                          </div>
                        </div>
                      </div>
                      <ThresholdGauge
                        current={t.currentValue}
                        green={t.greenThreshold}
                        yellow={t.yellowThreshold}
                        red={t.redThreshold}
                        format={t.metricFormat}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-[#e8dfd4] bg-white p-8 text-center shadow-sm">
            <Zap size={24} className="text-[#7d654e]/60 mx-auto mb-2" />
            <p className="text-sm text-[#7d654e]/60">No thresholds configured yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
