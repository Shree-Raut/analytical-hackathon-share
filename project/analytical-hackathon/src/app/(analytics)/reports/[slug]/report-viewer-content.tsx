"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Save,
  Download,
  Printer,
  Calendar,
  ChevronDown,
  Check,
  Building2,
  X,
  BarChart3,
  Loader2,
} from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import { PageHeader } from "@/components/analytics/page-header";
import {
  DataTableComposer,
  type ColumnDef,
} from "@/components/analytics/data-table-composer";
import { DataFreshness } from "@/components/analytics/data-freshness";
import type { MetricInfo } from "@/components/analytics/metric-popover";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface TemplateData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  templateType: string;
  metricRefs: string[];
}

interface MetricData {
  id: string;
  name: string;
  slug: string;
  format: string;
  category: string;
}

interface PropertyData {
  id: string;
  name: string;
  city: string;
  state: string;
  unitCount: number;
}

interface DataPoint {
  metricSlug: string;
  metricName: string;
  metricFormat: string;
  propertyId: string;
  propertyName: string;
  period: string;
  value: number;
  previousValue: number | null;
  budgetValue: number | null;
}

interface Props {
  template: TemplateData;
  metrics: MetricData[];
  properties: PropertyData[];
  dataPoints: DataPoint[];
  latestPeriod?: string;
  sourceSystems?: Record<string, string>;
  metricDefinitions?: Record<string, MetricInfo>;
  initialPropertyFilter?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function inferFormat(header: string): ColumnDef["format"] {
  const h = header.toLowerCase();
  if (
    /\$|rent|income|revenue|expense|noi|cost|amount|budget|gpr|egi|fee|charge|deposit|salary|payroll/.test(
      h,
    )
  )
    return "currency";
  if (/%|rate|occupancy|percent|ratio|margin|yield/.test(h)) return "percent";
  return "number";
}

function toColumnKey(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/* ─── Property Selector ──────────────────────────────────────────────────── */

function PropertySelector({
  properties,
  selected,
  onChange,
}: {
  properties: PropertyData[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allSelected = selected.length === 0;
  const label = allSelected
    ? `All Properties (${properties.length})`
    : `${selected.length} of ${properties.length}`;

  function toggle(id: string) {
    if (allSelected) {
      onChange(properties.filter((p) => p.id !== id).map((p) => p.id));
    } else if (selected.includes(id)) {
      const next = selected.filter((x) => x !== id);
      onChange(next.length === 0 ? [] : next);
    } else {
      const next = [...selected, id];
      onChange(next.length === properties.length ? [] : next);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white border border-[#e8dfd4] rounded-lg px-3 py-2 text-xs text-[#1a1510] hover:border-[#7d654e]/40 transition-colors"
      >
        <Building2 size={13} className="text-[#7d654e]" />
        {label}
        <ChevronDown size={12} className="text-[#7d654e]" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-64 bg-white border border-[#e8dfd4] rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
          <label className="flex items-center gap-2 px-3 py-2 text-xs text-[#7d654e] hover:bg-[#f7f3ef] cursor-pointer border-b border-[#e8dfd4]">
            <input
              type="checkbox"
              className="accent-[#7d654e]"
              checked={allSelected}
              onChange={() => onChange([])}
            />
            All Properties
          </label>
          {properties.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-2 px-3 py-2 text-xs text-[#1a1510] hover:bg-[#f7f3ef] cursor-pointer"
            >
              <input
                type="checkbox"
                className="accent-[#7d654e]"
                checked={allSelected || selected.includes(p.id)}
                onChange={() => toggle(p.id)}
              />
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-[10px] text-[#7d654e]/60 shrink-0">
                {p.city}, {p.state}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Save Report Panel ──────────────────────────────────────────────────── */

function SaveReportPanel({
  templateId,
  templateName,
  filters,
  onClose,
}: {
  templateId: string;
  templateName: string;
  filters: Record<string, unknown>;
  onClose: () => void;
}) {
  const [name, setName] = useState(`${templateName} — Copy`);
  const [tier, setTier] = useState("PERSONAL");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, name, filters, tier }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(onClose, 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save report");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#e8dfd4] rounded-xl shadow-xl z-30 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#1a1510]">
          Save Report Copy
        </span>
        <button
          onClick={onClose}
          className="text-[#7d654e] hover:text-[#1a1510]"
        >
          <X size={14} />
        </button>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 py-3 text-emerald-600 text-sm">
          <Check size={16} />
          Saved to My Workspace
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#faf7f4] border border-[#e8dfd4] rounded-lg px-3 py-2 text-sm text-[#1a1510] focus:outline-none focus:border-[#7d654e]/50"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-1">
                Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-[#faf7f4] border border-[#e8dfd4] rounded-lg px-3 py-2 text-sm text-[#1a1510] focus:outline-none focus:border-[#7d654e]/50 appearance-none"
              >
                <option value="PERSONAL">Personal</option>
                <option value="TEAM">Team</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#7d654e] hover:bg-[#7d654e]/90 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

const DATE_RANGES = [
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
  { label: "12 months", value: "12" },
  { label: "All time", value: "all" },
] as const;

export function ReportViewerContent({
  template,
  metrics,
  properties,
  dataPoints,
  latestPeriod: latestPeriodProp,
  sourceSystems,
  metricDefinitions,
  initialPropertyFilter,
}: Props) {
  const [dateRange, setDateRange] = useState("12");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>(() => {
    if (initialPropertyFilter) {
      const match = properties.find(
        (p) => p.name.toLowerCase() === initialPropertyFilter.toLowerCase(),
      );
      return match ? [match.id] : [];
    }
    return [];
  });
  const [showSave, setShowSave] = useState(false);
  const [visualize, setVisualize] = useState(false);
  const saveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSave) return;
    function handler(e: MouseEvent) {
      if (saveRef.current && !saveRef.current.contains(e.target as Node)) {
        setShowSave(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSave]);

  /* ── Column definitions ──────────────────────────────────────────────── */

  const baseColumns = useMemo((): ColumnDef[] => {
    const propertyCol: ColumnDef = {
      key: "property",
      label: "Property",
      visible: true,
      format: "text",
      align: "left",
      width: "220px",
    };

    if (template.metricRefs.length > 0) {
      const metricBySlug = new Map(metrics.map((m) => [m.slug, m]));

      const metricCols = template.metricRefs.map((ref): ColumnDef => {
        const metric = metricBySlug.get(ref);
        if (metric) {
          return {
            key: metric.slug,
            label: metric.name,
            visible: true,
            format:
              metric.format === "currency"
                ? "currency"
                : metric.format === "percent"
                  ? "percent"
                  : "number",
            align: "right",
          };
        }
        return {
          key: toColumnKey(ref),
          label: ref,
          visible: true,
          format: inferFormat(ref),
          align: "right",
        };
      });

      return [propertyCol, ...metricCols];
    }

    // Fallback: derive columns from the unique metrics present in data
    const seen = new Map<string, DataPoint>();
    for (const dp of dataPoints) {
      if (!seen.has(dp.metricSlug)) seen.set(dp.metricSlug, dp);
    }

    const metricCols = Array.from(seen.values()).map(
      (dp): ColumnDef => ({
        key: dp.metricSlug,
        label: dp.metricName,
        visible: true,
        format:
          dp.metricFormat === "currency"
            ? "currency"
            : dp.metricFormat === "percent"
              ? "percent"
              : "number",
        align: "right",
      }),
    );

    return [propertyCol, ...metricCols];
  }, [template.metricRefs, metrics, dataPoints]);

  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [labelOverrides, setLabelOverrides] = useState<Map<string, string>>(
    new Map(),
  );

  const displayColumns = useMemo(
    () =>
      baseColumns.map((c) => ({
        ...c,
        visible: !hiddenCols.has(c.key),
        label: labelOverrides.get(c.key) ?? c.label,
      })),
    [baseColumns, hiddenCols, labelOverrides],
  );

  /* ── All distinct periods in the data (sorted ascending) ────────────── */

  const allPeriods = useMemo(() => {
    const periods = new Set<string>();
    for (const dp of dataPoints) periods.add(dp.period);
    return Array.from(periods).sort();
  }, [dataPoints]);

  /* ── Filtered data ───────────────────────────────────────────────────── */

  const filteredData = useMemo(() => {
    let data = dataPoints;
    if (dateRange !== "all") {
      const count = parseInt(dateRange);
      const recentPeriods = new Set(allPeriods.slice(-count));
      data = data.filter((d) => recentPeriods.has(d.period));
    }
    if (selectedPropertyIds.length > 0) {
      data = data.filter((d) => selectedPropertyIds.includes(d.propertyId));
    }
    return data;
  }, [dataPoints, dateRange, selectedPropertyIds, allPeriods]);

  /* ── Table rows: one per property, most-recent value per metric ───── */

  const tableData = useMemo(() => {
    const metricKeys = baseColumns
      .filter((c) => c.key !== "property")
      .map((c) => c.key);

    const byProperty = new Map<
      string,
      {
        name: string;
        values: Map<string, { period: string; value: number }>;
      }
    >();

    for (const dp of filteredData) {
      if (!byProperty.has(dp.propertyId)) {
        byProperty.set(dp.propertyId, {
          name: dp.propertyName,
          values: new Map(),
        });
      }
      const prop = byProperty.get(dp.propertyId)!;

      const matchKey = metricKeys.find(
        (k) => k === dp.metricSlug || k === toColumnKey(dp.metricName),
      );
      if (!matchKey) continue;

      const prev = prop.values.get(matchKey);
      if (!prev || dp.period > prev.period) {
        prop.values.set(matchKey, { period: dp.period, value: dp.value });
      }
    }

    return Array.from(byProperty.values()).map((prop) => {
      const row: Record<string, unknown> = { property: prop.name };
      for (const key of metricKeys) {
        row[key] = prop.values.get(key)?.value ?? null;
      }
      return row;
    });
  }, [filteredData, baseColumns]);

  /* ── Sort / group state ──────────────────────────────────────────────── */

  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState<string | null>(null);

  const handleColumnToggle = useCallback((key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleSortChange = useCallback((key: string) => {
    setSortBy((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortDir("asc");
      }
      return key;
    });
  }, []);

  const handleColumnRename = useCallback((key: string, newLabel: string) => {
    setLabelOverrides((prev) => {
      const next = new Map(prev);
      next.set(key, newLabel);
      return next;
    });
  }, []);

  const currentFilters = useMemo(
    () => ({ dateRange, properties: selectedPropertyIds }),
    [dateRange, selectedPropertyIds],
  );

  const visibleMetricCount = displayColumns.filter(
    (c) => c.visible && c.key !== "property",
  ).length;

  return (
    <>
      <PageHeader
        title={template.name}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisualize((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-colors border",
                visualize
                  ? "bg-[#7d654e] text-white border-[#7d654e]"
                  : "bg-[#f7f3ef] hover:bg-[#eddece] border-[#e8dfd4] text-[#1a1510]",
              )}
            >
              <BarChart3 size={13} />
              Visualize
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#f7f3ef] hover:bg-[#eddece] border border-[#e8dfd4] text-[#1a1510] text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
            <button
              onClick={() => {
                const exportCols = displayColumns
                  .filter((c) => c.visible)
                  .map((c) => ({ key: c.key, label: c.label }));
                downloadCSV(tableData as Record<string, any>[], exportCols, template.slug);
              }}
              className="flex items-center gap-1.5 bg-[#f7f3ef] hover:bg-[#eddece] border border-[#e8dfd4] text-[#1a1510] text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={13} />
              Export
            </button>
            <div ref={saveRef} className="relative">
              <button
                onClick={() => setShowSave(!showSave)}
                className="flex items-center gap-1.5 bg-[#7d654e] hover:bg-[#7d654e]/90 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Save size={13} />
                Save Copy
              </button>
              {showSave && (
                <SaveReportPanel
                  templateId={template.id}
                  templateName={template.name}
                  filters={currentFilters}
                  onClose={() => setShowSave(false)}
                />
              )}
            </div>
          </div>
        }
      />

      {template.description && (
        <p className="text-sm text-[#7d654e] -mt-4 mb-6">
          {template.description}
        </p>
      )}

      {(latestPeriodProp || allPeriods.length > 0) && (
        <DataFreshness
          latestPeriod={latestPeriodProp || allPeriods[allPeriods.length - 1]}
          sourceCount={sourceSystems ? new Set(Object.values(sourceSystems)).size : undefined}
        />
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-[#e8dfd4]">
        <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
          <Calendar size={13} />
          <span>Period:</span>
        </div>
        <div className="flex items-center gap-1">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.value}
              onClick={() => setDateRange(dr.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                dateRange === dr.value
                  ? "bg-[#eddece] text-[#7d654e]"
                  : "text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef]",
              )}
            >
              {dr.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[#e8dfd4] mx-1" />

        <PropertySelector
          properties={properties}
          selected={selectedPropertyIds}
          onChange={setSelectedPropertyIds}
        />

        <div className="ml-auto text-xs text-[#7d654e] tabular-nums">
          {tableData.length}{" "}
          {tableData.length === 1 ? "property" : "properties"} ·{" "}
          {visibleMetricCount} {visibleMetricCount === 1 ? "metric" : "metrics"} ·{" "}
          {dateRange === "all"
            ? `${allPeriods.length} periods`
            : `${Math.min(parseInt(dateRange), allPeriods.length)} of ${allPeriods.length} periods`}
        </div>
      </div>

      {/* Data Table */}
      <DataTableComposer
        columns={displayColumns}
        data={tableData as Record<string, any>[]}
        groupBy={groupBy ?? undefined}
        sortBy={sortBy}
        sortDir={sortDir}
        onColumnToggle={handleColumnToggle}
        onGroupByChange={setGroupBy}
        onSortChange={handleSortChange}
        onColumnRename={handleColumnRename}
        showColumnPicker
        showChartToggle={visualize}
        sourceSystems={sourceSystems}
        metricDefinitions={metricDefinitions}
      />
    </>
  );
}
