"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  FileEdit,
  BookmarkCheck,
  Pin,
  Sparkles,
  Upload,
  MoreHorizontal,
  Plus,
  X,
  Check,
} from "lucide-react";

type TabKey = "drafts" | "saved" | "pinned";

interface SavedReport {
  id: string;
  name: string;
  updatedAt: string;
  templateSlug: string;
}

interface PinnedQuery {
  id: string;
  question: string;
  createdAt: string;
}

const MOCK_DRAFTS = [
  {
    id: "draft-1",
    name: "Q1 Ops Analysis (Draft)",
    updatedAt: "2026-03-05T14:30:00Z",
    type: "Draft" as const,
  },
  {
    id: "draft-2",
    name: "Custom Delinquency View (Draft)",
    updatedAt: "2026-03-03T09:15:00Z",
    type: "Draft" as const,
  },
];

interface Props {
  savedReports: SavedReport[];
  pinnedQueries: PinnedQuery[];
}

function TypeBadge({ type }: { type: "Draft" | "Saved" | "Pinned" }) {
  const config = {
    Draft: "bg-amber-50 text-amber-700 border-amber-200",
    Saved: "bg-blue-50 text-blue-700 border-blue-200",
    Pinned: "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        config[type]
      )}
    >
      {type === "Draft" && <FileEdit size={10} />}
      {type === "Saved" && <BookmarkCheck size={10} />}
      {type === "Pinned" && <Pin size={10} />}
      {type}
    </span>
  );
}

function PublishDialog({
  reportName,
  onClose,
}: {
  reportName: string;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-xl w-96 p-5">
        {submitted ? (
          <div className="flex flex-col items-center py-4 gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check size={20} className="text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-[#1a1510]">
              Submitted for review
            </p>
            <p className="text-xs text-[#7d654e]">
              An admin will review your report.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1a1510]">
                Publish to Company Menu
              </h3>
              <button
                onClick={onClose}
                className="text-[#7d654e] hover:text-[#1a1510]"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-sm text-[#7d654e] mb-1">
              This will submit{" "}
              <span className="font-medium text-[#1a1510]">{reportName}</span>{" "}
              for admin review. Continue?
            </p>
            <p className="text-xs text-[#7d654e]/60 mb-5">
              Once approved, it will appear in your organization&apos;s Company
              Menu.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 text-xs font-medium bg-[#7d654e] hover:bg-[#7d654e]/90 text-white rounded-lg transition-colors"
              >
                Submit for Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileEdit;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-12 text-center">
      <Icon size={32} className="mx-auto text-[#7d654e]/30 mb-3" />
      <p className="text-sm font-medium text-[#1a1510] mb-1">{title}</p>
      <p className="text-xs text-[#7d654e]/60 mb-4">{description}</p>
      <Link
        href="/create"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#7d654e] hover:bg-[#7d654e]/90 text-white rounded-lg transition-colors"
      >
        <Plus size={13} />
        Create Report
      </Link>
    </div>
  );
}

export function WorkspaceContent({ savedReports, pinnedQueries }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("drafts");
  const [publishTarget, setPublishTarget] = useState<string | null>(null);

  const tabs: { key: TabKey; label: string; icon: typeof FileEdit; count: number }[] = [
    { key: "drafts", label: "Drafts", icon: FileEdit, count: MOCK_DRAFTS.length },
    { key: "saved", label: "Saved", icon: BookmarkCheck, count: savedReports.length },
    { key: "pinned", label: "Pinned", icon: Pin, count: pinnedQueries.length },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                activeTab === tab.key
                  ? "bg-[#eddece] text-[#7d654e]"
                  : "text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef]"
              )}
            >
              <Icon size={13} />
              {tab.label}
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  activeTab === tab.key
                    ? "text-[#7d654e]"
                    : "text-[#7d654e]/60"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Drafts tab */}
      {activeTab === "drafts" && (
        <div className="space-y-2">
          {MOCK_DRAFTS.length === 0 ? (
            <EmptyState
              icon={FileEdit}
              title="No drafts yet"
              description="Reports you're working on will appear here."
            />
          ) : (
            MOCK_DRAFTS.map((draft) => (
              <div
                key={draft.id}
                className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-4 flex items-center gap-4 hover:border-[#7d654e]/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#1a1510] truncate">
                      {draft.name}
                    </span>
                    <TypeBadge type="Draft" />
                  </div>
                  <span className="text-xs text-[#7d654e]/60 tabular-nums">
                    Last edited{" "}
                    {new Date(draft.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    title="Coming in a future release"
                    className="px-3 py-1.5 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPublishTarget(draft.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#e8dfd4] hover:bg-[#f7f3ef] text-[#1a1510] rounded-lg transition-colors"
                  >
                    <Upload size={12} />
                    Publish to Company Menu
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Saved tab */}
      {activeTab === "saved" && (
        <div className="space-y-2">
          {savedReports.length === 0 ? (
            <EmptyState
              icon={BookmarkCheck}
              title="No saved reports"
              description="Save reports from the Library to access them quickly."
            />
          ) : (
            savedReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-4 flex items-center gap-4 hover:border-[#7d654e]/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/reports/${report.templateSlug}`}
                      className="text-sm font-medium text-[#1a1510] hover:text-[#7d654e] transition-colors truncate"
                    >
                      {report.name}
                    </Link>
                    <TypeBadge type="Saved" />
                  </div>
                  <span className="text-xs text-[#7d654e]/60 tabular-nums">
                    Saved{" "}
                    {new Date(report.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/reports/${report.templateSlug}`}
                    className="px-3 py-1.5 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setPublishTarget(report.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#e8dfd4] hover:bg-[#f7f3ef] text-[#1a1510] rounded-lg transition-colors"
                  >
                    <Upload size={12} />
                    Publish to Company Menu
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pinned tab */}
      {activeTab === "pinned" && (
        <div className="space-y-2">
          {pinnedQueries.length === 0 ? (
            <EmptyState
              icon={Pin}
              title="No pinned insights"
              description="Pin results from the AI Explorer (⌘K) to save them here."
            />
          ) : (
            pinnedQueries.map((query) => (
              <div
                key={query.id}
                className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-4 flex items-center gap-4 hover:border-[#7d654e]/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles
                      size={13}
                      className="text-[#7d654e] shrink-0"
                    />
                    <span className="text-sm font-medium text-[#1a1510] truncate">
                      {query.question}
                    </span>
                    <TypeBadge type="Pinned" />
                  </div>
                  <span className="text-xs text-[#7d654e]/60 tabular-nums">
                    Pinned{" "}
                    {new Date(query.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <button
                  title="Coming in a future release"
                  className="shrink-0 p-1.5 text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] rounded-lg transition-colors"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Publish confirmation dialog */}
      {publishTarget && (
        <PublishDialog
          reportName={publishTarget}
          onClose={() => setPublishTarget(null)}
        />
      )}
    </div>
  );
}
