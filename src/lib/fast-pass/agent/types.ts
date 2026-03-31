export interface MetricCandidate {
  id: string;
  name: string;
  slug: string;
  format?: string;
  category?: string;
}

export interface CandidateOption {
  name: string;
  slug: string;
  confidence: number;
}

export interface MappingResult {
  sourceHeader: string;
  matchedMetric: string | null;
  matchedSlug: string | null;
  confidence: number;
  alternatives: CandidateOption[];
  matchSource?:
    | "deterministic"
    | "memory_first"
    | "hybrid_llm_rerank"
    | "hybrid_llm_confirmed";
  rationale?: string;
  policyDecision?:
    | "deterministic_only"
    | "memory_locked"
    | "llm_override"
    | "llm_confirmed";
}

export interface MappingMemoryHint {
  sourceHeader: string;
  normalizedHeader: string;
  metricSlug: string;
  confidenceScore: number;
  reason: "pattern_match" | "alias_match" | "fuzzy_alias_match";
  fieldKind?: string;
  cursorPriority?: string;
  bundleAmbiguity?: string | null;
  evidenceCount?: number;
}
