import { ArrowRight, Check, ChevronRight, Loader2, XCircle } from "lucide-react";
import { ConfidenceBadge, MatchSourceBadge, getMatchRationale } from "./badges";
import type { MappingEntry, MetricOption } from "./types";

function stripHtmlAndDecode(text: string): string {
  if (!text) return text;
  
  // Strip HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };
  
  for (const [entity, char] of Object.entries(entities)) {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), char);
  }
  
  // Decode numeric entities
  cleaned = cleaned.replace(/&#(\d+);/g, (match, dec) => 
    String.fromCharCode(parseInt(dec, 10))
  );
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

interface StepMappingProps {
  mappings: MappingEntry[];
  allConfirmed: boolean;
  loading: boolean;
  metricCategories: Record<string, MetricOption[]>;
  onConfirmAll: () => void;
  onToggleConfirm: (sourceHeader: string) => void;
  onMappingChange: (sourceHeader: string, metricSlug: string) => void;
  onToggleExclude: (sourceHeader: string) => void;
  onExcludeAllUnmapped: () => void;
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
  onExcludeAllUnmapped,
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
        <div className="flex items-start justify-between mb-6 pb-5 border-b border-[#e8dfd4]">
          <div>
            <h2 className="text-xl font-bold text-[#1a1510] mb-1">Column Mapping</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {matchedCount} matched
              </span>
              <span className="text-[#7d654e]/40">·</span>
              <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {reviewCount} need review
              </span>
              <span className="text-[#7d654e]/40">·</span>
              <span className="inline-flex items-center gap-1.5 text-red-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {unmappedCount} unmapped
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onConfirmAll}
              disabled={allConfirmed}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7d654e] text-white text-sm font-medium rounded-lg hover:bg-[#6b5642] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              <Check size={16} />
              Confirm AI Matches (85%+)
            </button>
            {unmappedCount > 0 && (
              <button
                type="button"
                onClick={onExcludeAllUnmapped}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all shadow-sm hover:shadow"
              >
                <XCircle size={16} />
                Exclude All Unmapped ({unmappedCount})
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {mappings.map((m) => (
            <div
              key={m.sourceHeader}
              className={`p-4 rounded-lg border transition-all ${
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
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleConfirm(m.sourceHeader)}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                    m.status === "confirmed"
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-[#e8dfd4] hover:border-[#7d654e]"
                  }`}
                >
                  {m.status === "confirmed" && (
                    <Check size={12} className="text-white" />
                  )}
                </button>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-[180px] max-w-[220px]">
                      <span className="text-sm font-semibold text-[#1a1510] break-words">
                        {m.sourceHeader}
                      </span>
                    </div>

                    <ArrowRight size={16} className="text-[#7d654e] shrink-0" />

                    <div className="flex-1 min-w-[200px] max-w-[300px]">
                      <select
                        value={m.matchedSlug || ""}
                        onChange={(e) => onMappingChange(m.sourceHeader, e.target.value)}
                        className="w-full text-sm text-[#1a1510] bg-white border border-[#e8dfd4] rounded-lg px-3 py-2 outline-none focus:border-[#7d654e] focus:ring-2 focus:ring-[#7d654e]/20 transition-all"
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
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <div className="flex flex-col items-end gap-1.5">
                        <ConfidenceBadge confidence={m.confidence} status={m.status} />
                        <MatchSourceBadge matchSource={m.matchSource} />
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleExclude(m.sourceHeader)}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#e8dfd4] bg-white text-[#7d654e] hover:bg-[#f7f3ef] transition-colors shrink-0"
                      >
                        {m.excluded ? "Include" : "Exclude"}
                      </button>
                    </div>
                  </div>

                  {!m.excluded && m.alternatives.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2 pl-1">
                      <span className="text-xs text-[#7d654e]/80 font-medium">
                        Alternatives:
                      </span>
                      {m.alternatives.slice(0, 3).map((alt) => (
                        <button
                          key={`${m.sourceHeader}-${alt.slug}`}
                          type="button"
                          onClick={() => onMappingChange(m.sourceHeader, alt.slug)}
                          className="px-2.5 py-1 rounded-md text-xs border border-[#e8dfd4] bg-white text-[#7d654e] hover:bg-[#f7f3ef] hover:border-[#7d654e] transition-colors"
                        >
                          {alt.name} ({alt.confidence}%)
                        </button>
                      ))}
                    </div>
                  )}

                  {!m.excluded && m.matchedSlug && (
                    <div className="pl-1 text-xs text-[#7d654e]/70 leading-relaxed">
                      {(() => {
                        const metric = allMetricOptions.find(
                          (option) => option.slug === m.matchedSlug,
                        );
                        if (!metric) return null;
                        const rawDescription = metric.description || "No definition available";
                        const cleanDescription = stripHtmlAndDecode(rawDescription);
                        const truncatedDesc = cleanDescription.length > 120 
                          ? cleanDescription.substring(0, 120) + "..." 
                          : cleanDescription;
                        return (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span 
                              className="inline-block"
                              title={cleanDescription}
                            >
                              {truncatedDesc}
                            </span>
                            <span className="text-[#7d654e]/50">·</span>
                            <span className="font-medium text-[#7d654e]">{metric.format}</span>
                            <span className="text-[#7d654e]/50">·</span>
                            <span className="font-medium text-[#7d654e]">{metric.category}</span>
                            <span className="text-[#7d654e]/50">·</span>
                            <span className="italic">{getMatchRationale(m.sourceHeader, metric.name)}</span>
                            {m.rationale && (
                              <>
                                <span className="text-[#7d654e]/50">·</span>
                                <span className="text-amber-700">Agent note: {m.rationale}</span>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
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
