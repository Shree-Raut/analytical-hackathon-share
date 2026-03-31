"use client";

import { useState, useRef, useEffect } from "react";
import { SourceBadge } from "@/components/analytics/source-badge";

export interface MetricInfo {
  name: string;
  formula: string;
  format: string;
  sourceSystem: string;
  certificationTier: string;
  override?: { formula: string; label: string | null };
}

interface MetricPopoverProps {
  metric: MetricInfo;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}

export function MetricPopover({ metric, anchorRef, onClose }: MetricPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose, anchorRef]);

  const isCertified = metric.certificationTier?.toUpperCase() === "CANONICAL";
  const hasOverride = !!metric.override;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-2 bg-white border border-[#e8dfd4] rounded-xl shadow-xl p-4 max-w-sm z-50"
      style={{ minWidth: 260 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-[#1a1510]">{metric.name}</span>
        {metric.sourceSystem && <SourceBadge source={metric.sourceSystem} />}
      </div>

      <div className="space-y-2.5">
        <div>
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-0.5">
            Formula
          </span>
          <code className="text-xs text-[#1a1510] bg-[#faf7f4] px-2 py-1 rounded block font-mono">
            {metric.formula || "—"}
          </code>
        </div>

        <div className="flex gap-4">
          <div>
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-0.5">
              Format
            </span>
            <span className="text-xs text-[#1a1510]">{metric.format}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-0.5">
              Tier
            </span>
            <span className={`text-xs ${isCertified ? "text-amber-700 font-medium" : "text-[#1a1510]"}`}>
              {isCertified ? "Canonical" : metric.certificationTier || "Standard"}
            </span>
          </div>
        </div>

        {hasOverride && (
          <div className="border-t border-[#e8dfd4] pt-2.5 mt-2.5">
            <span className="text-[9px] uppercase tracking-[0.15em] text-amber-600 font-semibold block mb-1">
              Customer Override
            </span>
            {metric.override!.label && (
              <span className="text-xs text-[#7d654e] block mb-0.5">
                {metric.override!.label}
              </span>
            )}
            <code className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded block font-mono">
              {metric.override!.formula}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricHeaderProps {
  label: string;
  metric?: MetricInfo;
  children?: React.ReactNode;
}

export function MetricHeader({ label, metric, children }: MetricHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  if (!metric) {
    return <>{children ?? label}</>;
  }

  return (
    <span ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-1 border-b border-dotted border-[#7d654e]/30 hover:border-[#7d654e] transition-colors"
      >
        {children ?? label}
        <span className="text-[9px] text-[#7d654e]/40 font-normal">i</span>
      </button>
      {open && (
        <MetricPopover metric={metric} anchorRef={ref} onClose={() => setOpen(false)} />
      )}
    </span>
  );
}
