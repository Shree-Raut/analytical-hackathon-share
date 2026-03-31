"use client";

import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronDown, Sparkles } from "lucide-react";
import { MetricBadge } from "@/components/analytics/metric-badge";
import { cn } from "@/lib/utils";

interface MetricOverride {
  id: string;
  customerId: string;
  formula: string;
  label: string | null;
  description: string | null;
}

interface Metric {
  id: string;
  name: string;
  slug: string;
  description: string;
  formula: string;
  format: string;
  category: string;
  sourceSystem: string;
  dimensions: string;
  certificationTier: string;
  customerOverrides: MetricOverride[];
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "revenue", label: "Revenue" },
  { key: "expense", label: "Expense" },
  { key: "leasing", label: "Leasing" },
  { key: "maintenance", label: "Maintenance" },
  { key: "financial", label: "Financial" },
  { key: "resident", label: "Resident" },
  { key: "ai", label: "AI" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  revenue: "text-emerald-600 bg-emerald-50 border-emerald-200",
  expense: "text-rose-600 bg-rose-50 border-rose-200",
  leasing: "text-blue-600 bg-blue-50 border-blue-200",
  maintenance: "text-orange-600 bg-orange-50 border-orange-200",
  financial: "text-purple-600 bg-purple-50 border-purple-200",
  resident: "text-cyan-600 bg-cyan-50 border-cyan-200",
  ai: "text-indigo-600 bg-indigo-50 border-indigo-200",
};

const SOURCE_COLORS: Record<string, string> = {
  pms: "text-blue-600 bg-blue-50 border-blue-200",
  oxp: "text-purple-600 bg-purple-50 border-purple-200",
  homebody: "text-teal-600 bg-teal-50 border-teal-200",
  derived: "text-gray-600 bg-gray-50 border-gray-200",
};

const FORMAT_LABELS: Record<string, string> = {
  currency: "$",
  percent: "%",
  number: "#",
  days: "d",
};

export function MetricsBrowser({ metrics }: { metrics: Metric[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = metrics;
    if (activeCategory !== "all") {
      result = result.filter((m) => m.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q),
      );
    }
    return result;
  }, [metrics, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: metrics.length };
    for (const m of metrics) {
      counts[m.category] = (counts[m.category] || 0) + 1;
    }
    return counts;
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d654e]/60"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search metrics…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e8dfd4] rounded-lg text-[#1a1510] placeholder:text-[#7d654e]/60 outline-none focus:border-[#7d654e]/40 transition-colors"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 border-b border-[#e8dfd4] pb-px">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.key] ?? 0;
          const active = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-t-md transition-colors relative",
                active
                  ? "text-[#1a1510] bg-[#f7f3ef]"
                  : "text-[#7d654e] hover:text-[#94a3b8] hover:bg-[#f7f3ef]",
              )}
            >
              {cat.label}
              <span
                className={cn(
                  "ml-1.5 text-[10px] tabular-nums",
                  active ? "text-[#94a3b8]" : "text-[#7d654e]/60",
                )}
              >
                {count}
              </span>
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-px bg-[#7d654e]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Metrics table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold pb-3 px-3 text-left w-6" />
              <th className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold pb-3 px-3 text-left">
                Metric
              </th>
              <th className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold pb-3 px-3 text-left">
                Category
              </th>
              <th className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold pb-3 px-3 text-left">
                Format
              </th>
              <th className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold pb-3 px-3 text-left">
                Source
              </th>
              <th className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold pb-3 px-3 text-left">
                Tier
              </th>
              <th className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold pb-3 px-3 text-left" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((metric, i) => {
              const expanded = expandedId === metric.id;
              const hasOverrides = metric.customerOverrides.length > 0;
              let dims: string[] = [];
              try {
                dims = JSON.parse(metric.dimensions);
              } catch {}

              return (
                <MetricRow
                  key={metric.id}
                  metric={metric}
                  expanded={expanded}
                  hasOverrides={hasOverrides}
                  dimensions={dims}
                  even={i % 2 === 1}
                  onToggle={() =>
                    setExpandedId(expanded ? null : metric.id)
                  }
                />
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#7d654e]/60 text-sm">
                  No metrics match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-[#7d654e]/60 pt-2">
        Showing {filtered.length} of {metrics.length} metrics
      </div>
    </div>
  );
}

function MetricRow({
  metric,
  expanded,
  hasOverrides,
  dimensions,
  even,
  onToggle,
}: {
  metric: Metric;
  expanded: boolean;
  hasOverrides: boolean;
  dimensions: string[];
  even: boolean;
  onToggle: () => void;
}) {
  const catColors = CATEGORY_COLORS[metric.category] ?? "text-gray-500 bg-gray-50 border-gray-200";
  const srcColors = SOURCE_COLORS[metric.sourceSystem] ?? "text-gray-500 bg-gray-50 border-gray-200";

  return (
    <>
      <tr
        onClick={onToggle}
        className={cn(
          "transition-colors hover:bg-[#f7f3ef] cursor-pointer",
          even && "bg-[#f7f3ef]",
          expanded && "bg-[#f7f3ef]",
        )}
      >
        <td className="py-2.5 px-3 text-[#7d654e]/60">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </td>
        <td className="py-2.5 px-3">
          <span className="text-sm font-medium text-[#1a1510]">{metric.name}</span>
        </td>
        <td className="py-2.5 px-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
              catColors,
            )}
          >
            {metric.category}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <span className="text-xs text-[#7d654e] font-mono bg-[#f7f3ef] px-1.5 py-0.5 rounded">
            {FORMAT_LABELS[metric.format] ?? metric.format}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase",
              srcColors,
            )}
          >
            {metric.sourceSystem}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <MetricBadge tier={metric.certificationTier} />
        </td>
        <td className="py-2.5 px-3">
          {hasOverrides && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <Sparkles size={9} />
              Custom
            </span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-3 pb-4">
            <div className="ml-8 mt-1 p-4 rounded-lg bg-white border border-[#e8dfd4] space-y-4 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mb-1.5">
                    Description
                  </div>
                  <p className="text-sm text-[#1a1510] leading-relaxed">
                    {metric.description}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mb-1.5">
                    Dimensions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dimensions.length > 0 ? (
                      dimensions.map((d) => (
                        <span
                          key={d}
                          className="text-xs text-[#94a3b8] bg-[#f7f3ef] border border-[#e8dfd4] rounded px-2 py-0.5"
                        >
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#7d654e]/60">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Formula section */}
              {hasOverrides ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
                        Canonical Formula
                      </div>
                      <MetricBadge tier="CANONICAL" />
                    </div>
                    <pre className="text-xs text-[#1a1510] bg-[#f7f3ef] rounded p-3 font-mono overflow-x-auto border border-[#e8dfd4]">
                      {metric.formula}
                    </pre>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
                        Customer (Greystar)
                      </div>
                      <MetricBadge tier="CUSTOMER" />
                    </div>
                    <pre className="text-xs text-[#1a1510] bg-[#f7f3ef] rounded p-3 font-mono overflow-x-auto border border-amber-200">
                      {metric.customerOverrides[0]?.formula}
                    </pre>
                    {metric.customerOverrides[0]?.description && (
                      <p className="text-xs text-[#7d654e] mt-2">
                        {metric.customerOverrides[0].description}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mb-1.5">
                    Formula
                  </div>
                  <pre className="text-xs text-[#1a1510] bg-[#f7f3ef] rounded p-3 font-mono overflow-x-auto border border-[#e8dfd4]">
                    {metric.formula}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
