"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SOURCE_TYPE_FILTER: Record<string, (slug: string, category: string) => boolean> = {
  ENTRATA: () => true,
  YARDI_GL: (_slug, cat) => cat === "revenue" || cat === "expense",
  API: (_slug, cat) => cat === "leasing" || cat === "marketing",
};

interface MetricItem {
  id: string;
  name: string;
  slug: string;
  format: string;
  description: string;
}

const FORMAT_BADGE: Record<string, { label: string; className: string }> = {
  currency: { label: "$", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  percent: { label: "%", className: "bg-blue-50 text-blue-700 border-blue-200" },
  number: { label: "#", className: "bg-slate-50 text-slate-700 border-slate-200" },
};

interface Props {
  sourceName: string;
  sourceType: string;
  tableCount: string;
}

export function DataSourceActions({ sourceName, sourceType, tableCount }: Props) {
  const [showSchema, setShowSchema] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, MetricItem[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showSchema || metrics) return;
    setLoading(true);
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((data: { categories: Record<string, MetricItem[]> }) => {
        const filter = SOURCE_TYPE_FILTER[sourceType] ?? (() => true);
        const filtered: Record<string, MetricItem[]> = {};
        for (const [cat, items] of Object.entries(data.categories)) {
          const matching = items.filter((m) => filter(m.slug, cat));
          if (matching.length > 0) filtered[cat] = matching;
        }
        setMetrics(filtered);
      })
      .catch(() => setMetrics({}))
      .finally(() => setLoading(false));
  }, [showSchema, metrics, sourceType]);

  const totalMetrics = metrics
    ? Object.values(metrics).reduce((s, arr) => s + arr.length, 0)
    : 0;

  return (
    <>
      <button
        onClick={() => setShowSchema(true)}
        className="flex items-center gap-1 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] transition-colors"
      >
        View Schema
        <ArrowUpRight size={12} />
      </button>

      {showSchema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-2xl w-full max-w-2xl max-h-[75vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8dfd4]">
              <div>
                <h3 className="text-sm font-semibold text-[#1a1510]">{sourceName}</h3>
                <p className="text-[11px] text-[#7d654e] mt-0.5">
                  {tableCount}
                  {totalMetrics > 0 && ` · ${totalMetrics} metrics available from this source`}
                </p>
              </div>
              <button
                onClick={() => setShowSchema(false)}
                className="text-[#7d654e] hover:text-[#1a1510] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] px-5 py-4 space-y-5">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="text-[#7d654e] animate-spin" />
                </div>
              ) : metrics && Object.keys(metrics).length > 0 ? (
                Object.entries(metrics).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mb-2 capitalize">
                      {category} ({items.length})
                    </h4>
                    <div className="space-y-1.5">
                      {items.map((m) => {
                        const badge = FORMAT_BADGE[m.format] ?? FORMAT_BADGE.number;
                        return (
                          <div
                            key={m.id}
                            className="flex items-center gap-2.5 rounded-lg border border-[#e8dfd4] bg-[#faf7f4] px-3 py-2"
                          >
                            <span
                              className={cn(
                                "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border shrink-0",
                                badge.className,
                              )}
                            >
                              {badge.label}
                            </span>
                            <span className="text-xs font-medium text-[#1a1510] flex-1 truncate">
                              {m.name}
                            </span>
                            <Link
                              href="/data/metrics"
                              className="text-[10px] text-[#7d654e] hover:text-[#1a1510] transition-colors shrink-0"
                            >
                              View definition →
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#7d654e] py-6 text-center">
                  No metric data available for this source.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
