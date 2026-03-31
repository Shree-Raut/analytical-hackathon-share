import { AlertTriangle, Bot, Check, Clock, Sparkles, XCircle } from "lucide-react";

export function ConfidenceBadge({
  confidence,
  status,
}: {
  confidence: number;
  status: string;
}) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700">
        <Check size={10} /> Confirmed
      </span>
    );
  }
  if (confidence >= 85) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700">
        <Sparkles size={10} /> AI Matched · {confidence}%
      </span>
    );
  }
  if (confidence >= 40) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700">
        <AlertTriangle size={10} /> Review · {confidence}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-50 text-red-600">
      <XCircle size={10} /> Unmapped
    </span>
  );
}

export function MatchSourceBadge({
  matchSource,
}: {
  matchSource?: "deterministic" | "memory_first" | "hybrid_llm_rerank" | "hybrid_llm_confirmed";
}) {
  if (!matchSource) return null;
  if (matchSource === "hybrid_llm_rerank") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-violet-50 text-violet-700">
        <Bot size={10} /> LLM Reranked
      </span>
    );
  }
  if (matchSource === "hybrid_llm_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sky-50 text-sky-700">
        <Sparkles size={10} /> LLM Confirmed
      </span>
    );
  }
  if (matchSource === "memory_first") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-50 text-indigo-700">
        <Sparkles size={10} /> Memory Guided
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-stone-100 text-stone-700">
      <Clock size={10} /> Deterministic
    </span>
  );
}

export function getMatchRationale(sourceHeader: string, metricName: string): string {
  const source = sourceHeader.toLowerCase().trim();
  const target = metricName.toLowerCase().trim();
  const normSource = source.replace(/[^a-z0-9]/g, "");
  const normTarget = target.replace(/[^a-z0-9]/g, "");
  if (source === target || normSource === normTarget) return "Exact name match";
  if (source.includes(target) || target.includes(source)) return "Substring name match";
  return "Fuzzy similarity match";
}
