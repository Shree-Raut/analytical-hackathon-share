"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCard } from "@/components/analytics/alert-card";
import { EliOutreachModal } from "@/components/analytics/eli-outreach-modal";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: string;
  severity: string;
  status: string;
  propertyName: string;
  metricName: string;
  currentValue: string | number;
  thresholdValue: string | number;
  aiExplanation: string;
  triggeredAt: string;
  resolvedAt: string | null;
  acknowledgedBy: string | null;
}

type Tab = "all" | "critical" | "warning" | "resolved";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "warning", label: "Warning" },
  { key: "resolved", label: "Resolved" },
];

const METRIC_SLUG_MAP: Record<string, string> = {
  "Delinquency Rate": "delinquency-aging",
  "Occupancy Rate": "portfolio-snapshot",
  "Collections Rate": "delinquency-aging",
  "Work Orders Open": "portfolio-snapshot",
  "Net Operating Income": "noi-waterfall",
  "Renewal Rate": "leasing-funnel",
  "Leasing Velocity": "leasing-funnel",
  "Vacancy Rate": "portfolio-snapshot",
  "Move-Ins": "leasing-funnel",
  "Move-Outs": "leasing-funnel",
  "Expense Ratio": "noi-waterfall",
  "Satisfaction Score": "portfolio-snapshot",
  "AI Hours Saved": "portfolio-snapshot",
  "Gross Potential Rent": "noi-waterfall",
  "Effective Gross Income": "noi-waterfall",
  "Loss to Lease": "noi-waterfall",
  "Total Operating Expense": "noi-waterfall",
  "Bad Debt": "delinquency-aging",
};

export function AlertsFeed({
  alerts,
  counts,
}: {
  alerts: AlertItem[];
  counts: Record<Tab, number>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [outreachAlert, setOutreachAlert] = useState<AlertItem | null>(null);
  const router = useRouter();

  const filtered = alerts.filter((alert) => {
    switch (activeTab) {
      case "critical":
        return alert.severity === "CRITICAL" && alert.status !== "RESOLVED";
      case "warning":
        return alert.severity === "WARNING" && alert.status !== "RESOLVED";
      case "resolved":
        return alert.status === "RESOLVED";
      default:
        return true;
    }
  });

  async function handleAcknowledge(id: string) {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ACKNOWLEDGED",
        acknowledgedBy: "demo_user",
      }),
    });
    router.refresh();
  }

  async function handleSnooze(id: string) {
    const snoozedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "SNOOZED",
        snoozedUntil: snoozedUntil.toISOString(),
      }),
    });
    router.refresh();
  }

  function handleViewReport(alert: AlertItem) {
    const slug = METRIC_SLUG_MAP[alert.metricName] || "portfolio-snapshot";
    router.push(`/reports/${slug}?property=${encodeURIComponent(alert.propertyName)}`);
  }

  function handleTriggerOutreach(alert: AlertItem) {
    setOutreachAlert(alert);
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#e8dfd4]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === tab.key
                ? "text-[#1a1510]"
                : "text-[#7d654e] hover:text-[#94a3b8]",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                activeTab === tab.key
                  ? "bg-[#eddece] text-[#1a1510]"
                  : "bg-[#f7f3ef] text-[#7d654e]",
              )}
            >
              {counts[tab.key]}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7d654e] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={cn(alert.status === "RESOLVED" && "opacity-50")}
          >
            <AlertCard
              alert={alert}
              onAcknowledge={
                alert.status !== "RESOLVED" && alert.status !== "ACKNOWLEDGED"
                  ? handleAcknowledge
                  : undefined
              }
              onSnooze={
                alert.status !== "RESOLVED" && alert.status !== "SNOOZED"
                  ? handleSnooze
                  : undefined
              }
              onViewReport={() => handleViewReport(alert)}
              onTriggerOutreach={
                alert.metricName.toLowerCase().includes("delinquency") ||
                alert.metricName.toLowerCase().includes("collections")
                  ? () => handleTriggerOutreach(alert)
                  : undefined
              }
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-[#7d654e] py-8 text-center">
            No alerts in this category.
          </p>
        )}
      </div>

      <EliOutreachModal
        isOpen={!!outreachAlert}
        onClose={() => setOutreachAlert(null)}
        propertyName={outreachAlert?.propertyName ?? ""}
        metricName={outreachAlert?.metricName ?? ""}
        currentValue={outreachAlert?.currentValue ?? ""}
      />
    </div>
  );
}
