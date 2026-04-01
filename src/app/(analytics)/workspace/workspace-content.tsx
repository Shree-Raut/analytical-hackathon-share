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
  Clock,
  Download,
  Calendar,
  Mail,
  Edit2,
  Save,
} from "lucide-react";

// "pinned" |
type TabKey = "drafts" | "saved" | "scheduled";

interface SavedReport {
  id: string;
  name: string;
  updatedAt: string;
  templateSlug: string;
  layoutOverrides: string;
}

interface PinnedQuery {
  id: string;
  question: string;
  createdAt: string;
}

interface ScheduledReport {
  id: string;
  reportId: string;
  reportName: string;
  frequency: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  time: string;
  recipients: string[];
  format: string;
  lastSentAt: string | null;
  createdAt: string;
  layoutOverrides: string;
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
  scheduledReports: ScheduledReport[];
}

// | "Pinned" 
function TypeBadge({ type }: { type: "Draft" | "Saved" }) {
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
      {/* {type === "Pinned" && <Pin size={10} />} */}
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

export function WorkspaceContent({ savedReports, pinnedQueries, scheduledReports }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("drafts");
  const [publishTarget, setPublishTarget] = useState<string | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingReportName, setEditingReportName] = useState("");
  const [savingReport, setSavingReport] = useState(false);

  const tabs: { key: TabKey; label: string; icon: typeof FileEdit; count: number }[] = [
    { key: "drafts", label: "Drafts", icon: FileEdit, count: MOCK_DRAFTS.length },
    { key: "saved", label: "Saved", icon: BookmarkCheck, count: savedReports.length },
    // { key: "pinned", label: "Pinned", icon: Pin, count: pinnedQueries.length },
    { key: "scheduled", label: "Scheduled", icon: Clock, count: scheduledReports.length },
  ];

  const handleDownloadReport = async (schedule: ScheduledReport) => {
    try {
      // Parse the layout overrides to get the report data
      const layoutData = JSON.parse(schedule.layoutOverrides);
      const { columns = [], data = [] } = layoutData;

      // Create CSV content
      const headers = columns.map((c: { label: string }) => c.label);
      const csvRows = [
        headers.join(","),
        ...data.map((row: Record<string, unknown>) => 
          columns.map((c: { key: string }) => {
            const value = row[c.key];
            // Escape values that contain commas or quotes
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(",")
        ),
      ];
      const csvContent = csvRows.join("\n");

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${schedule.reportName.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download report");
    }
  };

  const handleDownloadSavedReport = async (report: SavedReport) => {
    try {
      // Parse the layout overrides to get the report data
      const layoutData = JSON.parse(report.layoutOverrides);
      const { columns = [], data = [] } = layoutData;

      if (!columns.length || !data.length) {
        alert("This report has no data to download");
        return;
      }

      // Create CSV content
      const headers = columns.map((c: { label: string }) => c.label);
      const csvRows = [
        headers.join(","),
        ...data.map((row: Record<string, unknown>) => 
          columns.map((c: { key: string }) => {
            const value = row[c.key];
            // Escape values that contain commas or quotes
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(",")
        ),
      ];
      const csvContent = csvRows.join("\n");

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.name.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download report");
    }
  };

  const formatSchedule = (schedule: ScheduledReport) => {
    const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (schedule.frequency === "DAILY") {
      return `Daily at ${schedule.time}`;
    }
    if (schedule.frequency === "WEEKLY" && schedule.dayOfWeek) {
      return `${dayNames[schedule.dayOfWeek]}s at ${schedule.time}`;
    }
    if (schedule.frequency === "MONTHLY" && schedule.dayOfMonth) {
      const suffix = schedule.dayOfMonth === 1 ? "st" : schedule.dayOfMonth === 2 ? "nd" : schedule.dayOfMonth === 3 ? "rd" : "th";
      return `${schedule.dayOfMonth}${suffix} of each month at ${schedule.time}`;
    }
    return `${schedule.frequency} at ${schedule.time}`;
  };

  const handleEditReport = (report: SavedReport) => {
    setEditingReportId(report.id);
    setEditingReportName(report.name);
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditingReportName("");
  };

  const handleSaveReportName = async (reportId: string) => {
    if (!editingReportName.trim()) {
      alert("Report name cannot be empty");
      return;
    }

    setSavingReport(true);
    try {
      const response = await fetch("/api/reports/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          name: editingReportName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report");
      }

      // Success - reload the page to show updated name
      window.location.reload();
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report name. Please try again.");
    } finally {
      setSavingReport(false);
    }
  };

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
                    {editingReportId === report.id ? (
                      <input
                        type="text"
                        value={editingReportName}
                        onChange={(e) => setEditingReportName(e.target.value)}
                        className="text-sm font-medium text-[#1a1510] border border-[#7d654e] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#7d654e]/30"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveReportName(report.id);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <Link
                        href={`/reports/${report.templateSlug}`}
                        className="text-sm font-medium text-[#1a1510] hover:text-[#7d654e] transition-colors truncate"
                      >
                        {report.name}
                      </Link>
                    )}
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
                  {editingReportId === report.id ? (
                    <>
                      <button
                        onClick={() => handleSaveReportName(report.id)}
                        disabled={savingReport}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#7d654e] hover:bg-[#6b5642] text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save size={12} />
                        {savingReport ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={savingReport}
                        className="px-3 py-1.5 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDownloadSavedReport(report)}
                        title="Download CSV"
                        className="p-1.5 text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] rounded-lg transition-colors"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleEditReport(report)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] hover:bg-[#f7f3ef] rounded-lg transition-colors"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => setPublishTarget(report.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#e8dfd4] hover:bg-[#f7f3ef] text-[#1a1510] rounded-lg transition-colors"
                      >
                        <Upload size={12} />
                        Publish to Company Menu
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pinned tab */}
      {/* {activeTab === "pinned" && (
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
      )} */}

      {/* Scheduled tab */}
      {activeTab === "scheduled" && (
        <div className="space-y-2">
          {scheduledReports.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No scheduled reports"
              description="Set up report delivery schedules in Fast-Pass to see them here."
            />
          ) : (
            scheduledReports.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-4 hover:border-[#7d654e]/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-[#1a1510] truncate">
                        {schedule.reportName}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <Clock size={10} />
                        Active
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
                        <Calendar size={12} />
                        <span>{formatSchedule(schedule)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
                        <Mail size={12} />
                        <span>{schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? "s" : ""}</span>
                      </div>
                      {schedule.lastSentAt && (
                        <div className="text-xs text-[#7d654e]/60 tabular-nums">
                          Last sent{" "}
                          {new Date(schedule.lastSentAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDownloadReport(schedule)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#7d654e] hover:bg-[#6b5642] text-white rounded-lg transition-colors"
                    >
                      <Download size={12} />
                      Download CSV
                    </button>
                  </div>
                </div>
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
