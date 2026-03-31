import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Clock, Eye, BellOff, CheckCircle2, Zap, UserPlus } from "lucide-react";

interface Alert {
  id: string;
  severity: string;
  propertyName: string;
  metricName: string;
  currentValue: string | number;
  thresholdValue: string | number;
  aiExplanation: string;
  triggeredAt: string;
  status: string;
}

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onAssign?: (id: string) => void;
  onViewReport?: (id: string) => void;
  onTriggerOutreach?: (id: string) => void;
  className?: string;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    border: "border-l-red-500",
    badge: "text-red-700 bg-red-50",
    icon: AlertCircle,
    label: "Critical",
  },
  WARNING: {
    border: "border-l-amber-500",
    badge: "text-amber-700 bg-amber-50",
    icon: AlertTriangle,
    label: "Warning",
  },
} as const;

export function AlertCard({
  alert,
  onAcknowledge,
  onSnooze,
  onAssign,
  onViewReport,
  onTriggerOutreach,
  className,
}: AlertCardProps) {
  const severity =
    SEVERITY_CONFIG[alert.severity.toUpperCase() as keyof typeof SEVERITY_CONFIG] ??
    SEVERITY_CONFIG.WARNING;
  const SeverityIcon = severity.icon;

  return (
    <div
      className={cn(
        "bg-white border border-[#e8dfd4] rounded-xl shadow-sm border-l-4 p-4",
        severity.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Severity + Property */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
                severity.badge
              )}
            >
              <SeverityIcon size={11} />
              {severity.label}
            </span>
            <span className="text-sm font-medium text-[#1a1510] truncate">
              {alert.propertyName}
            </span>
          </div>

          {/* Metric + Values */}
          <div className="space-y-1">
            <div className="text-sm text-[#7d654e]">{alert.metricName}</div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#7d654e]">
                Current:{" "}
                <span className="text-[#1a1510] font-medium">{alert.currentValue}</span>
              </span>
              <span className="text-[#e8dfd4]">|</span>
              <span className="text-[#7d654e]">
                Threshold:{" "}
                <span className="text-[#1a1510] font-medium">{alert.thresholdValue}</span>
              </span>
            </div>
          </div>

          {/* AI Explanation */}
          {alert.aiExplanation && (
            <p className="text-xs text-[#1a1510]/70 leading-relaxed italic">
              {alert.aiExplanation}
            </p>
          )}

          {/* Footer: time + actions */}
          <div className="flex items-center gap-3 pt-1">
            <span className="flex items-center gap-1 text-[11px] text-[#7d654e]/60">
              <Clock size={10} />
              {timeAgo(alert.triggeredAt)}
            </span>

            <div className="flex items-center gap-1 ml-auto">
              {onAcknowledge && (
                <button
                  type="button"
                  onClick={() => onAcknowledge(alert.id)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] transition-colors"
                >
                  <CheckCircle2 size={11} />
                  Acknowledge
                </button>
              )}
              {onSnooze && (
                <button
                  type="button"
                  onClick={() => onSnooze(alert.id)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] transition-colors"
                >
                  <BellOff size={11} />
                  Snooze
                </button>
              )}
              {onAssign && (
                <button
                  type="button"
                  onClick={() => onAssign(alert.id)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] transition-colors"
                >
                  <UserPlus size={11} />
                  Assign
                </button>
              )}
              {onViewReport && (
                <button
                  type="button"
                  onClick={() => onViewReport(alert.id)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] transition-colors"
                >
                  <Eye size={11} />
                  View Report
                </button>
              )}
              {onTriggerOutreach && (
                <button
                  type="button"
                  onClick={() => onTriggerOutreach(alert.id)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] transition-colors"
                >
                  <Zap size={11} />
                  Trigger ELI+ Outreach
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
