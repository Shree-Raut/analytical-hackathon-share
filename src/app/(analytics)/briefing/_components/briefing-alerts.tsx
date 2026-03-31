"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCard } from "@/components/analytics/alert-card";
import { EliOutreachModal } from "@/components/analytics/eli-outreach-modal";

interface BriefingAlert {
  id: string;
  severity: string;
  status: string;
  propertyName: string;
  metricName: string;
  currentValue: string | number;
  thresholdValue: string | number;
  aiExplanation: string;
  triggeredAt: string;
}

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

export function BriefingAlerts({ alerts }: { alerts: BriefingAlert[] }) {
  const router = useRouter();
  const [outreachAlert, setOutreachAlert] = useState<BriefingAlert | null>(null);

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

  function handleViewReport(alert: BriefingAlert) {
    const slug = METRIC_SLUG_MAP[alert.metricName] || "portfolio-snapshot";
    router.push(`/reports/${slug}?property=${encodeURIComponent(alert.propertyName)}`);
  }

  function handleTriggerOutreach(alert: BriefingAlert) {
    setOutreachAlert(alert);
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onAcknowledge={handleAcknowledge}
          onSnooze={handleSnooze}
          onViewReport={() => handleViewReport(alert)}
          onTriggerOutreach={
            alert.metricName.toLowerCase().includes("delinquency") ||
            alert.metricName.toLowerCase().includes("collections")
              ? () => handleTriggerOutreach(alert)
              : undefined
          }
        />
      ))}
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
