"use client";

import { RefreshCw } from "lucide-react";

interface DataFreshnessProps {
  latestPeriod: string;
  lastUpdated?: string;
  sourceCount?: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx > 11) return period;
  return `${MONTH_NAMES[idx]} ${year}`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isFresh(period: string): boolean {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return period >= current;
}

export function DataFreshness({ latestPeriod, lastUpdated, sourceCount }: DataFreshnessProps) {
  const fresh = isFresh(latestPeriod);

  return (
    <div className="flex items-center gap-2 text-[11px] text-[#7d654e]/60 -mt-3 mb-5">
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
          fresh ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />
      <span>Data as of {formatPeriod(latestPeriod)}</span>
      {lastUpdated && (
        <>
          <span className="text-[#7d654e]/30">·</span>
          <span className="inline-flex items-center gap-1">
            <RefreshCw size={9} className="text-[#7d654e]/40" />
            Updated {formatRelativeTime(lastUpdated)}
          </span>
        </>
      )}
      {sourceCount != null && sourceCount > 0 && (
        <>
          <span className="text-[#7d654e]/30">·</span>
          <span>{sourceCount} {sourceCount === 1 ? "source" : "sources"}</span>
        </>
      )}
    </div>
  );
}
