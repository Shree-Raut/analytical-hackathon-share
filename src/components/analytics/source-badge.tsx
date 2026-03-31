"use client";

import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source: string;
  className?: string;
}

const SOURCE_CONFIG: Record<string, { label: string; classes: string }> = {
  pms:      { label: "PMS",    classes: "bg-blue-50 text-blue-600" },
  oxp:      { label: "OXP",    classes: "bg-purple-50 text-purple-600" },
  homebody: { label: "RXP",    classes: "bg-emerald-50 text-emerald-600" },
  derived:  { label: "Calc",   classes: "bg-slate-100 text-slate-500" },
  import:   { label: "Import", classes: "bg-amber-50 text-amber-600" },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source.toLowerCase()];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center text-[9px] font-medium rounded-full px-1.5 py-0.5 leading-none",
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
