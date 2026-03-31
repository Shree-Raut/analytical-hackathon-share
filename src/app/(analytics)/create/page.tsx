"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  LayoutGrid,
  DollarSign,
  ScrollText,
  AlertTriangle,
  TrendingUp,
  CalendarDays,
  Check,
  Columns3,
  BarChart3,
  Save,
  CheckCircle2,
  Loader2,
  Download,
} from "lucide-react";
import {
  DataTableComposer,
  type ColumnDef,
} from "@/components/analytics/data-table-composer";
import Link from "next/link";
import { downloadCSV } from "@/lib/export-csv";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ComposeResult {
  type: "report";
  columns: ColumnDef[];
  data: Record<string, any>[];
  explanation: string;
  metricsUsed: string[];
}

interface MetricItem {
  id: string;
  name: string;
  slug: string;
  format: string;
  description: string;
}

type MetricCategories = Record<string, MetricItem[]>;

// ─── Constants ───────────────────────────────────────────────────────────────

const STARTER_PROMPTS = [
  "Weekly operations summary by property",
  "Which properties need attention?",
  "12-month occupancy trend",
  "Compare top 5 vs bottom 5 by NOI",
  "Student housing pre-lease status",
  "Income statement — budget vs actual",
];

const TEMPLATE_CARDS = [
  {
    slug: "box-score",
    name: "Box Score",
    description: "Multi-section operations dashboard",
    icon: LayoutGrid,
  },
  {
    slug: "income-statement",
    name: "Income Statement",
    description: "Financial statement with GL hierarchy",
    icon: DollarSign,
  },
  {
    slug: "rent-roll",
    name: "Rent Roll",
    description: "Unit-level detail with charges",
    icon: ScrollText,
  },
  {
    slug: "delinquency",
    name: "Delinquency",
    description: "Aging buckets and collections",
    icon: AlertTriangle,
  },
  {
    slug: "leasing-funnel",
    name: "Leasing Funnel",
    description: "Lead-to-lease pipeline",
    icon: TrendingUp,
  },
  {
    slug: "daily-operations",
    name: "Daily Operations",
    description: "Daily tracking across metrics",
    icon: CalendarDays,
  },
];

const DIMENSIONS = [
  "Property",
  "Region",
  "Unit Type",
  "Floor Plan",
  "Time Period",
] as const;

const PERIODS = ["MTD", "QTD", "YTD", "Rolling 12"] as const;

// ─── Page Component ──────────────────────────────────────────────────────────

export default function CreateReportPage() {
  // AI prompt state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ComposeResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const refinementRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Progressive reveal state
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Table interaction state
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [groupBy, setGroupBy] = useState<string | null>(null);

  // Manual builder state
  const [manualOpen, setManualOpen] = useState(false);
  const [metricCategories, setMetricCategories] =
    useState<MetricCategories | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(),
  );
  const [metricSearch, setMetricSearch] = useState("");
  const [selectedDimension, setSelectedDimension] = useState<string>("Property");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("MTD");
  const [comparison, setComparison] = useState({ priorPeriod: false, budget: false });
  const [manualGroupBy, setManualGroupBy] = useState<string>("");

  // Save state
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveTier, setSaveTier] = useState<"PERSONAL" | "TEAM">("PERSONAL");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [customTemplateId, setCustomTemplateId] = useState<string | null>(null);

  // Fetch custom template ID on mount
  useEffect(() => {
    fetch("/api/templates?category=custom")
      .then((r) => r.json())
      .then((templates: { id: string; slug: string }[]) => {
        const custom = templates.find((t) => t.slug === "custom-ai-generated");
        if (custom) setCustomTemplateId(custom.id);
      })
      .catch(() => {});
  }, []);

  // ─── AI Compose ──────────────────────────────────────────────────────────

  const submitPrompt = useCallback(
    async (text: string) => {
      if (!text.trim() || isGenerating) return;

      setIsGenerating(true);
      setShowExplanation(false);
      setShowTable(false);
      setConversationHistory((h) => [...h, text]);

      try {
        const res = await fetch("/api/ai/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        const data: ComposeResult = await res.json();
        setResult(data);
        setColumns(data.columns);
        setGroupBy(null);
        setSaveName(text.slice(0, 60));
        setSaveOpen(false);
        setSaved(false);

        setTimeout(() => setShowExplanation(true), 150);
        setTimeout(() => setShowTable(true), 600);

        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      } catch {
        setResult({
          type: "report",
          columns: [],
          data: [],
          explanation: "Something went wrong generating your report. Please try again.",
          metricsUsed: [],
        });
        setShowExplanation(true);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating],
  );

  const handleSubmit = useCallback(() => {
    submitPrompt(prompt);
  }, [prompt, submitPrompt]);

  const handleStarterClick = useCallback(
    (text: string) => {
      setPrompt(text);
      submitPrompt(text);
    },
    [submitPrompt],
  );

  const handleRefinement = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const val = (e.target as HTMLInputElement).value.trim();
        if (val) {
          setPrompt(val);
          submitPrompt(val);
          (e.target as HTMLInputElement).value = "";
        }
      }
    },
    [submitPrompt],
  );

  // ─── Column & GroupBy Handlers ───────────────────────────────────────────

  const handleColumnToggle = useCallback((key: string) => {
    setColumns((cols) =>
      cols.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)),
    );
  }, []);

  const handleGroupByChange = useCallback((key: string | null) => {
    setGroupBy(key);
  }, []);

  // ─── Manual Builder: Fetch Metrics ───────────────────────────────────────

  useEffect(() => {
    if (manualOpen && !metricCategories && !metricsLoading) {
      setMetricsLoading(true);
      fetch("/api/metrics")
        .then((r) => r.json())
        .then((data) => setMetricCategories(data.categories ?? {}))
        .catch(() => setMetricCategories({}))
        .finally(() => setMetricsLoading(false));
    }
  }, [manualOpen, metricCategories, metricsLoading]);

  const toggleMetric = useCallback((id: string) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredCategories = useMemo(() => {
    if (!metricCategories) return {};
    if (!metricSearch.trim()) return metricCategories;
    const q = metricSearch.toLowerCase();
    const filtered: MetricCategories = {};
    for (const [cat, metrics] of Object.entries(metricCategories)) {
      const matched = metrics.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
      if (matched.length) filtered[cat] = matched;
    }
    return filtered;
  }, [metricCategories, metricSearch]);

  // ─── Manual Builder: Preview ─────────────────────────────────────────────

  const handleManualPreview = useCallback(() => {
    if (selectedMetrics.size === 0) return;

    const allMetrics = metricCategories
      ? Object.values(metricCategories).flat()
      : [];
    const chosen = allMetrics.filter((m) => selectedMetrics.has(m.id));

    const parts = chosen.map((m) => m.name.toLowerCase()).join(", ");
    const dimPart = selectedDimension ? ` by ${selectedDimension.toLowerCase()}` : "";
    const periodPart = selectedPeriod ? ` (${selectedPeriod})` : "";
    const compParts: string[] = [];
    if (comparison.priorPeriod) compParts.push("prior period comparison");
    if (comparison.budget) compParts.push("budget comparison");
    const compPart = compParts.length ? ` with ${compParts.join(" and ")}` : "";

    const synthesized = `Show me ${parts}${dimPart}${periodPart}${compPart}`;
    setPrompt(synthesized);
    submitPrompt(synthesized);
    setManualOpen(false);
  }, [
    selectedMetrics,
    metricCategories,
    selectedDimension,
    selectedPeriod,
    comparison,
    submitPrompt,
  ]);

  // ─── Save ────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!saveName.trim() || saving || !customTemplateId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/reports/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: customTemplateId,
          name: saveName.trim(),
          tier: saveTier,
          filters: {
            prompt: conversationHistory,
            groupBy,
          },
          columns: result?.columns ?? [],
          data: result?.data ?? [],
        }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || "Failed to save report");
      }
    } catch {
      setSaveError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }, [saveName, saveTier, saving, customTemplateId, conversationHistory, columns, groupBy, result]);

  // ─── Keyboard: Enter to submit ───────────────────────────────────────────

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  const hasResult = result && result.columns.length > 0;

  return (
    <div className="min-h-screen bg-[#faf7f4]">
      {/* ── Refinement Bar (visible after result) ─────────────────────────── */}
      {hasResult && (
        <div className="sticky top-0 z-20 bg-[#faf7f4]/95 backdrop-blur-sm border-b border-[#e8dfd4] px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Sparkles size={16} className="text-[#7d654e] shrink-0" />
            <input
              ref={refinementRef}
              type="text"
              placeholder="Refine your report... e.g., 'Add budget comparison', 'Sort by occupancy descending'"
              className="flex-1 bg-white border border-[#e8dfd4] rounded-lg px-4 py-2 text-sm text-[#1a1510] placeholder:text-[#7d654e]/50 outline-none focus:border-[#7d654e] transition-colors"
              onKeyDown={handleRefinement}
              disabled={isGenerating}
            />
            {isGenerating && (
              <Loader2
                size={16}
                className="text-[#7d654e] animate-spin shrink-0"
              />
            )}
          </div>
        </div>
      )}

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* ── Hero Prompt Area ───────────────────────────────────────────── */}
        {!hasResult && (
          <div className="pt-12 pb-8">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h1 className="text-2xl font-bold text-[#1a1510] mb-2">
                What do you need to know?
              </h1>
              <p className="text-[#7d654e] text-sm">
                Describe a report in plain language — or start from a template
                below
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="e.g., Show me weekly operations across all properties with occupancy, leasing velocity, and delinquency..."
                  className="w-full bg-white border border-[#e8dfd4] rounded-xl px-5 py-4 text-sm text-[#1a1510] placeholder:text-[#7d654e]/40 outline-none focus:border-[#7d654e] transition-colors resize-none shadow-sm"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-[#7d654e] text-white hover:bg-[#6b5643] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isGenerating ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  Generate Report
                </button>
              </div>

              {/* Starter Prompts */}
              <div className="flex flex-wrap gap-2 mt-5 justify-center">
                {STARTER_PROMPTS.map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => handleStarterClick(sp)}
                    disabled={isGenerating}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-full hover:bg-[#f7f3ef] hover:border-[#7d654e]/30 transition-colors disabled:opacity-40"
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Quick Start Templates ─────────────────────────────────────── */}
        {!hasResult && (
          <div className="mt-6 mb-8">
            <h2 className="text-sm font-semibold text-[#7d654e] mb-3">
              Or start from a template
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {TEMPLATE_CARDS.map((t) => {
                const Icon = t.icon;
                return (
                  <Link
                    key={t.slug}
                    href={`/reports/${t.slug}`}
                    className="flex-shrink-0 w-44 bg-white border border-[#e8dfd4] rounded-xl p-4 hover:bg-[#f7f3ef] hover:border-[#7d654e]/30 transition-colors shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#f7f3ef] flex items-center justify-center mb-3 group-hover:bg-[#eddece] transition-colors">
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                        className="text-[#7d654e]"
                      />
                    </div>
                    <div className="text-sm font-semibold text-[#1a1510] mb-0.5">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-[#7d654e] leading-snug">
                      {t.description}
                    </div>
                    <div className="mt-2.5 text-[11px] font-medium text-[#7d654e] group-hover:text-[#1a1510] transition-colors">
                      Use Template &rarr;
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Manual Builder (collapsible) ──────────────────────────────── */}
        {!hasResult && (
          <div className="border border-[#e8dfd4] rounded-xl bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setManualOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-[#7d654e] hover:bg-[#f7f3ef] transition-colors"
            >
              {manualOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Build manually — select metrics and dimensions
            </button>

            {manualOpen && (
              <div className="border-t border-[#e8dfd4] px-5 py-5 space-y-6">
                {/* Step 1: Choose Metrics */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-[#1a1510] uppercase tracking-wider">
                      Step 1: Choose Metrics
                    </h3>
                    {selectedMetrics.size > 0 && (
                      <span className="text-[11px] text-[#7d654e]">
                        {selectedMetrics.size} selected
                      </span>
                    )}
                  </div>

                  <div className="relative mb-3">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d654e]/50"
                    />
                    <input
                      type="text"
                      placeholder="Search metrics..."
                      value={metricSearch}
                      onChange={(e) => setMetricSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg text-[#1a1510] placeholder:text-[#7d654e]/40 outline-none focus:border-[#7d654e] transition-colors"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
                    {metricsLoading && (
                      <div className="flex items-center gap-2 py-4 justify-center text-sm text-[#7d654e]">
                        <Loader2 size={14} className="animate-spin" />
                        Loading metrics...
                      </div>
                    )}
                    {metricCategories &&
                      Object.entries(filteredCategories).map(
                        ([cat, metrics]) => (
                          <div key={cat}>
                            <div className="text-[10px] uppercase tracking-wider text-[#7d654e]/60 font-semibold mb-1.5">
                              {cat}
                            </div>
                            <div className="space-y-0.5">
                              {metrics.map((m) => (
                                <label
                                  key={m.id}
                                  className="flex items-center gap-3 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-[#f7f3ef] transition-colors group"
                                >
                                  <span
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      selectedMetrics.has(m.id)
                                        ? "bg-[#7d654e] border-[#7d654e]"
                                        : "border-[#e8dfd4] group-hover:border-[#7d654e]/50"
                                    }`}
                                    onClick={() => toggleMetric(m.id)}
                                  >
                                    {selectedMetrics.has(m.id) && (
                                      <Check
                                        size={10}
                                        className="text-white"
                                      />
                                    )}
                                  </span>
                                  <span
                                    className="flex-1 min-w-0"
                                    onClick={() => toggleMetric(m.id)}
                                  >
                                    <span className="text-sm text-[#1a1510]">
                                      {m.name}
                                    </span>
                                    <span className="ml-2 text-[10px] text-[#7d654e]/60">
                                      {m.description.length > 50
                                        ? m.description.slice(0, 50) + "..."
                                        : m.description}
                                    </span>
                                  </span>
                                  <FormatBadge format={m.format} />
                                </label>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    {metricCategories &&
                      Object.keys(filteredCategories).length === 0 && (
                        <div className="py-4 text-center text-sm text-[#7d654e]">
                          No metrics match your search
                        </div>
                      )}
                  </div>
                </div>

                {/* Step 2: Choose Dimensions */}
                <div>
                  <h3 className="text-xs font-semibold text-[#1a1510] uppercase tracking-wider mb-3">
                    Step 2: Choose Dimensions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {DIMENSIONS.map((dim) => (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => setSelectedDimension(dim)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          selectedDimension === dim
                            ? "bg-[#7d654e] text-white border-[#7d654e]"
                            : "bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef]"
                        }`}
                      >
                        {dim}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Configure */}
                <div>
                  <h3 className="text-xs font-semibold text-[#1a1510] uppercase tracking-wider mb-3">
                    Step 3: Configure
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Period */}
                    <div>
                      <div className="text-[11px] text-[#7d654e] mb-1.5 font-medium">
                        Period
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PERIODS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSelectedPeriod(p)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                              selectedPeriod === p
                                ? "bg-[#7d654e] text-white border-[#7d654e]"
                                : "bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comparison */}
                    <div>
                      <div className="text-[11px] text-[#7d654e] mb-1.5 font-medium">
                        Comparison
                      </div>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              comparison.priorPeriod
                                ? "bg-[#7d654e] border-[#7d654e]"
                                : "border-[#e8dfd4] group-hover:border-[#7d654e]/50"
                            }`}
                            onClick={() =>
                              setComparison((c) => ({
                                ...c,
                                priorPeriod: !c.priorPeriod,
                              }))
                            }
                          >
                            {comparison.priorPeriod && (
                              <Check size={10} className="text-white" />
                            )}
                          </span>
                          <span
                            className="text-xs text-[#1a1510]"
                            onClick={() =>
                              setComparison((c) => ({
                                ...c,
                                priorPeriod: !c.priorPeriod,
                              }))
                            }
                          >
                            Prior Period
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              comparison.budget
                                ? "bg-[#7d654e] border-[#7d654e]"
                                : "border-[#e8dfd4] group-hover:border-[#7d654e]/50"
                            }`}
                            onClick={() =>
                              setComparison((c) => ({
                                ...c,
                                budget: !c.budget,
                              }))
                            }
                          >
                            {comparison.budget && (
                              <Check size={10} className="text-white" />
                            )}
                          </span>
                          <span
                            className="text-xs text-[#1a1510]"
                            onClick={() =>
                              setComparison((c) => ({
                                ...c,
                                budget: !c.budget,
                              }))
                            }
                          >
                            Budget
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Group By */}
                    <div>
                      <div className="text-[11px] text-[#7d654e] mb-1.5 font-medium">
                        Group By
                      </div>
                      <select
                        value={manualGroupBy}
                        onChange={(e) => setManualGroupBy(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#e8dfd4] rounded-lg text-[#1a1510] outline-none focus:border-[#7d654e] transition-colors"
                      >
                        <option value="">None</option>
                        <option value="property">Property</option>
                        <option value="region">Region</option>
                        <option value="unit_type">Unit Type</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleManualPreview}
                    disabled={selectedMetrics.size === 0 || isGenerating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-[#7d654e] text-white hover:bg-[#6b5643] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {isGenerating ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Sparkles size={15} />
                    )}
                    Preview Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Thinking Animation ───────────────────────────────────────── */}
        <AnimatePresence>
          {isGenerating && !hasResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-12 flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 bg-[#7d654e] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
                />
                <span
                  className="w-2.5 h-2.5 bg-[#7d654e] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
                />
                <span
                  className="w-2.5 h-2.5 bg-[#7d654e] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
                />
              </div>
              <p className="text-sm text-[#7d654e]">
                Analyzing your data and composing the report...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result Area ───────────────────────────────────────────────── */}
        {hasResult && (
          <div ref={resultRef} className="mt-2">
            {/* Explanation — progressive reveal */}
            <AnimatePresence>
              {showExplanation && result.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-white border border-[#e8dfd4] rounded-xl p-4 mb-4 shadow-sm"
                >
                  <p className="text-sm text-[#1a1510] leading-relaxed whitespace-pre-line">
                    {result.explanation}
                  </p>
                  {result.metricsUsed.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.metricsUsed.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 text-[10px] font-medium text-[#7d654e] bg-[#f7f3ef] rounded-md"
                        >
                          {m.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar + Table — progressive reveal */}
            <AnimatePresence>
              {showTable && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Toolbar */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef] transition-colors"
                    >
                      <Columns3 size={13} />
                      Columns
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef] transition-colors"
                    >
                      <BarChart3 size={13} />
                      Chart
                    </button>

                    {columns.length > 0 && (
                      <select
                        value={groupBy ?? ""}
                        onChange={(e) =>
                          handleGroupByChange(e.target.value || null)
                        }
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef] transition-colors outline-none"
                      >
                        <option value="">No grouping</option>
                        {columns
                          .filter(
                            (c) =>
                              c.format === "text" || c.format === undefined,
                          )
                          .map((c) => (
                            <option key={c.key} value={c.key}>
                              Group by {c.label}
                            </option>
                          ))}
                      </select>
                    )}

                    <div className="flex-1" />

                    <button
                      type="button"
                      onClick={() => {
                        if (result) {
                          const exportCols = columns
                            .filter((c) => c.visible !== false)
                            .map((c) => ({ key: c.key, label: c.label }));
                          downloadCSV(result.data, exportCols, saveName || "report");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-[#7d654e] border-[#e8dfd4] hover:bg-[#f7f3ef] transition-colors"
                    >
                      <Download size={13} />
                      Export
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSaveOpen((v) => !v);
                        setSaved(false);
                        setSaveError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-[#7d654e] text-white hover:bg-[#6b5643] transition-colors shadow-sm"
                    >
                      <Save size={13} />
                      Save Report
                    </button>
                  </div>

                  {/* Save Panel */}
                  {saveOpen && (
                    <div className="bg-white border border-[#e8dfd4] rounded-xl p-4 mb-4 shadow-sm">
                      {saved ? (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2
                            size={16}
                            className="text-green-600 shrink-0"
                          />
                          <span className="text-green-700 font-medium">
                            Saved to My Workspace
                          </span>
                          <Link
                            href="/workspace"
                            className="ml-2 text-xs text-[#7d654e] underline underline-offset-2 hover:text-[#1a1510]"
                          >
                            View workspace &rarr;
                          </Link>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={saveName}
                              onChange={(e) => setSaveName(e.target.value)}
                              placeholder="Report name"
                              className="flex-1 px-3 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg text-[#1a1510] placeholder:text-[#7d654e]/40 outline-none focus:border-[#7d654e] transition-colors"
                            />
                            <div className="flex items-center border border-[#e8dfd4] rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setSaveTier("PERSONAL")}
                                className={`px-3 py-2 text-xs font-medium transition-colors ${
                                  saveTier === "PERSONAL"
                                    ? "bg-[#7d654e] text-white"
                                    : "bg-white text-[#7d654e] hover:bg-[#f7f3ef]"
                                }`}
                              >
                                Personal
                              </button>
                              <button
                                type="button"
                                onClick={() => setSaveTier("TEAM")}
                                className={`px-3 py-2 text-xs font-medium transition-colors ${
                                  saveTier === "TEAM"
                                    ? "bg-[#7d654e] text-white"
                                    : "bg-white text-[#7d654e] hover:bg-[#f7f3ef]"
                                }`}
                              >
                                Team
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={!saveName.trim() || saving || !customTemplateId}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[#7d654e] text-white hover:bg-[#6b5643] disabled:opacity-40 transition-colors"
                            >
                              {saving ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Save size={13} />
                              )}
                              Save
                            </button>
                          </div>
                          {saveError && (
                            <p className="mt-2 text-xs text-red-600">{saveError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Data Table */}
                  <DataTableComposer
                    columns={columns}
                    data={result.data}
                    groupBy={groupBy ?? undefined}
                    onColumnToggle={handleColumnToggle}
                    onGroupByChange={handleGroupByChange}
                    showColumnPicker
                    showChartToggle
                    showGroupBy
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Empty result fallback ─────────────────────────────────────── */}
        {result && result.columns.length === 0 && !isGenerating && (
          <div className="mt-8 bg-white border border-[#e8dfd4] rounded-xl p-8 text-center shadow-sm">
            <p className="text-sm text-[#7d654e] whitespace-pre-line">{result.explanation}</p>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setPrompt("");
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-[#7d654e] bg-[#f7f3ef] rounded-lg hover:bg-[#eddece] transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Utility Components ────────────────────────────────────────────────────

function FormatBadge({ format }: { format: string }) {
  const label =
    format === "currency"
      ? "$"
      : format === "percent"
        ? "%"
        : format === "number"
          ? "#"
          : format;

  const colors =
    format === "currency"
      ? "bg-emerald-50 text-emerald-700"
      : format === "percent"
        ? "bg-blue-50 text-blue-700"
        : "bg-[#f7f3ef] text-[#7d654e]";

  return (
    <span
      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${colors} shrink-0`}
    >
      {label}
    </span>
  );
}
