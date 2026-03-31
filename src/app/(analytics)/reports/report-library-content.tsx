"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Clock,
  BarChart3,
  Wallet,
  Users,
  Wrench,
  Sparkles,
  LayoutGrid,
  DollarSign,
  ShieldCheck,
  Home,
  Receipt,
  Megaphone,
  TrendingUp,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  templateType: string;
  metricRefs: string;
  isActive: boolean;
}

const PAGE_SIZE = 50;

const CATEGORIES = [
  { label: "All", value: "all", icon: LayoutGrid },
  { label: "Operations", value: "operations", icon: BarChart3 },
  { label: "Finance", value: "finance", icon: Wallet },
  { label: "Leasing", value: "leasing", icon: Users },
  { label: "Maintenance", value: "maintenance", icon: Wrench },
  { label: "AI", value: "ai", icon: Sparkles },
  { label: "Revenue", value: "revenue", icon: DollarSign },
  { label: "Compliance", value: "compliance", icon: ShieldCheck },
  { label: "Resident", value: "resident", icon: Home },
  { label: "Collections", value: "collections", icon: Receipt },
  { label: "Marketing", value: "marketing", icon: Megaphone },
  { label: "Benchmarking", value: "benchmarking", icon: TrendingUp },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  operations: "bg-blue-50 text-blue-700 border-blue-200",
  finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  leasing: "bg-purple-50 text-purple-700 border-purple-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  ai: "bg-cyan-50 text-cyan-700 border-cyan-200",
  revenue: "bg-green-50 text-green-700 border-green-200",
  compliance: "bg-rose-50 text-rose-700 border-rose-200",
  resident: "bg-indigo-50 text-indigo-700 border-indigo-200",
  collections: "bg-orange-50 text-orange-700 border-orange-200",
  marketing: "bg-pink-50 text-pink-700 border-pink-200",
  benchmarking: "bg-slate-100 text-slate-700 border-slate-200",
};

const MAX_PREVIEW_COLS = 8;

function parseColumnHeaders(metricRefs: string): string[] {
  try {
    const refs: string[] = JSON.parse(metricRefs || "[]");
    return refs.map((ref) =>
      ref
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    );
  } catch {
    return [];
  }
}

function ColumnPreviewPopover({ metricRefs }: { metricRefs: string }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const headers = useMemo(() => parseColumnHeaders(metricRefs), [metricRefs]);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(true), 300);
  }, []);

  const handleLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShow(false), 150);
  }, []);

  if (headers.length === 0) return null;

  const displayed = headers.slice(0, MAX_PREVIEW_COLS);
  const remaining = headers.length - displayed.length;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className="text-[#7d654e]/50 hover:text-[#7d654e] transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow((s) => !s);
        }}
      >
        <Info size={13} />
      </button>
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 bg-white border border-[#e8dfd4] rounded-xl shadow-lg p-3 max-w-xs w-64">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mb-1.5">
            Columns
          </div>
          <div className="text-xs text-[#1a1510] leading-relaxed">
            Property, {displayed.join(", ")}
            {remaining > 0 && (
              <span className="text-[#7d654e]/60"> +{remaining} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReportLibraryContent({ templates }: { templates: Template[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    for (const t of templates) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory =
        activeCategory === "all" || t.category === activeCategory;
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, search, activeCategory]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const activeCount = filtered.filter((t) => t.isActive).length;
  const comingSoonCount = filtered.filter((t) => !t.isActive).length;
  const hasMore = visibleCount < filtered.length;

  function handleCategoryChange(value: string) {
    setActiveCategory(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      {/* Search + Category Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d654e]"
            size={15}
          />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full bg-white border border-[#e8dfd4] rounded-lg pl-9 pr-4 py-2 text-sm text-[#1a1510] placeholder-[#7d654e] focus:outline-none focus:border-[#7d654e]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.value] ?? 0;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap",
                  activeCategory === cat.value
                    ? "bg-[#eddece] text-[#7d654e]"
                    : "text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef]",
                )}
              >
                <Icon size={13} />
                {cat.label}
                <span
                  className={cn(
                    "text-[10px] tabular-nums",
                    activeCategory === cat.value
                      ? "text-[#7d654e]"
                      : "text-[#7d654e]/60",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center gap-3 mb-4 text-xs text-[#7d654e]">
        <span>{activeCount} available</span>
        {comingSoonCount > 0 && (
          <>
            <span className="w-px h-3 bg-[#e8dfd4]" />
            <span>{comingSoonCount} coming soon</span>
          </>
        )}
        <span className="w-px h-3 bg-[#e8dfd4]" />
        <span>
          Showing {visible.length} of {filtered.length}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((template) => {
          const metricCount = (() => {
            try {
              return JSON.parse(template.metricRefs || "[]").length;
            } catch {
              return 0;
            }
          })();
          const catColor =
            CATEGORY_COLORS[template.category] || CATEGORY_COLORS.operations;

          return (
            <div
              key={template.id}
              className={cn(
                "group relative bg-white border border-[#e8dfd4] rounded-xl p-5 transition-all shadow-sm",
                template.isActive
                  ? "hover:border-[#7d654e]/30 hover:shadow-md"
                  : "opacity-50",
              )}
            >
              {!template.isActive && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider bg-[#f7f3ef] text-[#7d654e] px-2 py-0.5 rounded-full border border-[#e8dfd4]">
                  <Clock size={10} />
                  Coming Soon
                </span>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#f7f3ef] shrink-0">
                  <FileText size={16} className="text-[#7d654e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1a1510] truncate">
                    {template.name}
                  </h3>
                  <span
                    className={cn(
                      "inline-flex items-center mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full border capitalize",
                      catColor,
                    )}
                  >
                    {template.category}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#7d654e] leading-relaxed mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[#e8dfd4]/60">
                <span className="flex items-center gap-1.5 text-[11px] text-[#7d654e]">
                  {metricCount > 0
                    ? `${metricCount} metric${metricCount !== 1 ? "s" : ""}`
                    : "—"}
                  {metricCount > 0 && (
                    <ColumnPreviewPopover metricRefs={template.metricRefs} />
                  )}
                </span>
                {template.isActive ? (
                  <Link
                    href={`/reports/${template.slug}`}
                    className="inline-flex items-center gap-1.5 bg-[#7d654e] hover:bg-[#7d654e]/90 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                  >
                    Open
                  </Link>
                ) : (
                  <span className="text-[11px] text-[#7d654e]/60">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-[#7d654e] bg-[#f7f3ef] hover:bg-[#eddece] border border-[#e8dfd4] rounded-lg transition-colors"
          >
            Show more ({Math.min(PAGE_SIZE, filtered.length - visibleCount)}{" "}
            remaining)
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#7d654e] text-sm">
          No reports match your search.
        </div>
      )}
    </div>
  );
}
