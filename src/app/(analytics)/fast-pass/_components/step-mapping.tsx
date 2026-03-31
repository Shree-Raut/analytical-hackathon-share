import { ArrowRight, Check, ChevronRight, Loader2 } from "lucide-react";
import { ConfidenceBadge, MatchSourceBadge, getMatchRationale } from "./badges";
import type { MappingEntry, MetricOption } from "./types";

interface StepMappingProps {
  mappings: MappingEntry[];
  allConfirmed: boolean;
  loading: boolean;
  metricCategories: Record<string, MetricOption[]>;
  onConfirmAll: () => void;
  onToggleConfirm: (sourceHeader: string) => void;
  onMappingChange: (sourceHeader: string, metricSlug: string) => void;
  onToggleExclude: (sourceHeader: string) => void;
  onRetry: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepMapping({
  mappings,
  allConfirmed,
  loading,
  metricCategories,
  onConfirmAll,
  onToggleConfirm,
  onMappingChange,
  onToggleExclude,
  onRetry,
  onNext,
  onBack,
}: StepMappingProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={32} className="text-[#7d654e] animate-spin" />
        <p className="text-sm text-[#7d654e]">
          Matching columns against metric library...
        </p>
      </div>
    );
  }

  const matchedCount = mappings.filter((m) => m.confidence >= 85).length;
  const reviewCount = mappings.filter(
    (m) => m.confidence >= 40 && m.confidence < 85,
  ).length;
  const unmappedCount = mappings.filter((m) => m.confidence < 40).length;
  const allMetricOptions = Object.values(metricCategories).flat();

  if (mappings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-6 text-center">
          <p className="text-sm text-[#7d654e]">
            No mappings yet. Try running the matcher again.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#7d654e] text-white text-xs font-medium rounded-lg hover:bg-[#6b5642] transition-colors"
          >
            Retry Mapping
          </button>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-sm font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1a1510]">Column Mapping</h2>
            <p className="text-sm text-[#7d654e] mt-0.5">
              {matchedCount} matched · {reviewCount} need review · {unmappedCount}{" "}
              unmapped
            </p>
          </div>
          <button
            type="button"
            onClick={onConfirmAll}
            disabled={allConfirmed}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7d654e] text-white text-xs font-medium rounded-lg hover:bg-[#6b5642] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            Confirm AI Matches (85%+)
          </button>
        </div>

        <div className="space-y-2">
          {mappings.map((m) => (
            <div
              key={m.sourceHeader}
              className={`p-3 rounded-lg border transition-colors ${
                m.excluded
                  ? "bg-[#faf7f4] border-[#e8dfd4] opacity-70"
                  : m.status === "confirmed"
                    ? "bg-emerald-50/50 border-emerald-200"
                    : m.status === "review"
                      ? "bg-amber-50/30 border-amber-200"
                      : m.status === "unmapped"
                        ? "bg-red-50/30 border-red-200"
                        : "bg-white border-[#e8dfd4]"
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onToggleConfirm(m.sourceHeader)}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    m.status === "confirmed"
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-[#e8dfd4] hover:border-[#7d654e]"
                  }`}
                >
                  {m.status === "confirmed" && (
                    <Check size={12} className="text-white" />
                  )}
                </button>

                <div className="w-40 shrink-0">
                  <span className="text-sm font-medium text-[#1a1510]">
                    {m.sourceHeader}
                  </span>
                </div>

                <ArrowRight size={14} className="text-[#7d654e] shrink-0" />

                <select
                  value={m.matchedSlug || ""}
                  onChange={(e) => onMappingChange(m.sourceHeader, e.target.value)}
                  className="flex-1 text-sm text-[#1a1510] bg-white border border-[#e8dfd4] rounded-lg px-3 py-1.5 outline-none focus:border-[#7d654e] transition-colors"
                >
                  <option value="">— Unmapped —</option>
                  {Object.entries(metricCategories).map(([category, metrics]) => (
                    <optgroup key={category} label={category}>
                      {metrics.map((metric) => (
                        <option key={metric.slug} value={metric.slug}>
                          {metric.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <div className="w-40 shrink-0 flex flex-col items-end gap-1">
                  <ConfidenceBadge confidence={m.confidence} status={m.status} />
                  <MatchSourceBadge matchSource={m.matchSource} />
                </div>

                <button
                  type="button"
                  onClick={() => onToggleExclude(m.sourceHeader)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-[#e8dfd4] bg-white text-[#7d654e] hover:bg-[#f7f3ef]"
                >
                  {m.excluded ? "Include" : "Exclude"}
                </button>
              </div>

              {!m.excluded && m.alternatives.length > 1 && (
                <div className="mt-2.5 ml-9 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#7d654e] mr-1">
                    Alternatives:
                  </span>
                  {m.alternatives.slice(0, 3).map((alt) => (
                    <button
                      key={`${m.sourceHeader}-${alt.slug}`}
                      type="button"
                      onClick={() => onMappingChange(m.sourceHeader, alt.slug)}
                      className="px-2 py-0.5 rounded-md text-[11px] border border-[#e8dfd4] bg-white text-[#7d654e] hover:bg-[#f7f3ef]"
                    >
                      {alt.name} ({alt.confidence}%)
                    </button>
                  ))}
                </div>
              )}

              {!m.excluded && m.matchedSlug && (
                <div className="mt-2 ml-9 text-[11px] text-[#7d654e]">
                  {(() => {
                    const metric = allMetricOptions.find(
                      (option) => option.slug === m.matchedSlug,
                    );
                    if (!metric) return null;
                    return (
                      <span
                        title={`Definition: ${metric.description || "No definition available"}\nFormat: ${metric.format}\nCategory: ${metric.category}\nReason: ${getMatchRationale(m.sourceHeader, metric.name)}`}
                      >
                        {metric.description || "No definition available"} ·{" "}
                        {metric.format} · {metric.category} ·{" "}
                        {getMatchRationale(m.sourceHeader, metric.name)}
                        {m.rationale ? ` · Agent note: ${m.rationale}` : ""}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7d654e] text-white text-sm font-medium rounded-lg hover:bg-[#6b5642] transition-colors"
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
