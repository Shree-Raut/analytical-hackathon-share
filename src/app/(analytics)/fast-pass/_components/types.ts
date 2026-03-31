import type { ColumnDef } from "@/components/analytics/data-table-composer";

export interface UploadResult {
  fileName: string;
  sheetNames: string[];
  targetSheet: string;
  detectedHeaderRowIdx: number;
  headerRowIdx: number;
  previewRows: unknown[][];
  headers: string[];
  dataRows: Record<string, unknown>[];
  rowCount: number;
  columnCount: number;
}

export interface MappingEntry {
  sourceHeader: string;
  matchedMetric: string | null;
  matchedSlug: string | null;
  confidence: number;
  status: "matched" | "review" | "unmapped" | "confirmed";
  alternatives: { name: string; slug: string; confidence: number }[];
  excluded?: boolean;
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

export interface ClarificationQuestion {
  id: string;
  column: string;
  question: string;
  suggestedAnswer: string;
  type: "mapping" | "calculation";
  options?: string[];
}

export interface ChatMessage {
  role: "agent" | "user";
  text: string;
  questionId?: string;
  suggestedAnswer?: string;
  options?: string[];
}

export interface MetricOption {
  id: string;
  name: string;
  slug: string;
  format: string;
  category: string;
  description?: string;
}

export type PublicationTier = "PERSONAL" | "TEAM" | "PUBLISHED" | "CERTIFIED";

export interface SaveState {
  reportName: string;
  pubTier: PublicationTier;
  scheduleEnabled: boolean;
  scheduleFreq: string;
  scheduleDay: string;
  scheduleTime: string;
  scheduleRecipients: string;
  saving: boolean;
  saved: boolean;
  saveError: string | null;
}

export interface PreviewState {
  columns: ColumnDef[];
  data: Record<string, unknown>[];
}

export const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Map Columns" },
  { id: 3, label: "Clarify" },
  { id: 4, label: "Preview" },
  { id: 5, label: "Save" },
] as const;

export const PUB_TIERS = [
  {
    id: "PERSONAL" as const,
    label: "Personal",
    desc: "Only you can see this report",
  },
  { id: "TEAM" as const, label: "Team", desc: "Shared with your team" },
  {
    id: "PUBLISHED" as const,
    label: "Published",
    desc: "Available to all users in your org",
  },
  {
    id: "CERTIFIED" as const,
    label: "Certified",
    desc: "Verified as an official org report",
  },
];
