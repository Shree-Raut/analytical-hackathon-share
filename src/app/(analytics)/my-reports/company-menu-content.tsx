"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PublicationTierBadge } from "@/components/analytics/publication-tier-badge";
import {
  FileText,
  ArrowUpRight,
  Folder,
  FolderOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  tier: string;
  ownerId: string | null;
  teamId: string | null;
  updatedAt: string;
  folder: string;
  template: { name: string; slug: string; category: string; templateType: string };
}

type FolderKey = "all" | "weekly" | "monthly" | "regional" | "adhoc";

const FOLDERS: { key: FolderKey; label: string }[] = [
  { key: "all", label: "All Reports" },
  { key: "weekly", label: "Weekly Reports" },
  { key: "monthly", label: "Monthly Reports" },
  { key: "regional", label: "Regional Reports" },
  { key: "adhoc", label: "Ad Hoc Reports" },
];

function formatOwner(ownerId: string | null, teamId: string | null): string {
  if (ownerId) {
    return ownerId
      .replace("user_", "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (teamId) {
    return `${teamId.charAt(0).toUpperCase() + teamId.slice(1)} Team`;
  }
  return "—";
}

export function CompanyMenuContent({ reports }: { reports: Report[] }) {
  const [activeFolder, setActiveFolder] = useState<FolderKey>("all");

  const folderCounts = useMemo(() => {
    const counts: Record<FolderKey, number> = {
      all: reports.length,
      weekly: 0,
      monthly: 0,
      regional: 0,
      adhoc: 0,
    };
    for (const r of reports) {
      counts[r.folder as FolderKey] = (counts[r.folder as FolderKey] || 0) + 1;
    }
    return counts;
  }, [reports]);

  const tierCounts = useMemo(() => {
    const counts = { CERTIFIED: 0, PUBLISHED: 0, TEAM: 0, PERSONAL: 0 };
    for (const r of reports) {
      const tier = r.tier.toUpperCase() as keyof typeof counts;
      if (tier in counts) counts[tier]++;
    }
    return counts;
  }, [reports]);

  const totalReports = reports.length;
  const barSegments = [
    { key: "CERTIFIED", count: tierCounts.CERTIFIED, color: "bg-amber-400", label: "Certified" },
    { key: "PUBLISHED", count: tierCounts.PUBLISHED, color: "bg-blue-400", label: "Published" },
    { key: "TEAM", count: tierCounts.TEAM, color: "bg-slate-400", label: "Team" },
    { key: "PERSONAL", count: tierCounts.PERSONAL, color: "bg-slate-200", label: "Personal" },
  ].filter((s) => s.count > 0);

  const filtered = useMemo(() => {
    if (activeFolder === "all") return reports;
    return reports.filter((r) => r.folder === activeFolder);
  }, [reports, activeFolder]);

  return (
    <div className="space-y-6">
      {/* Governance summary */}
      <div className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-amber-600" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
            Governance
          </span>
        </div>
        <div className="text-xs text-[#1a1510] mb-2.5">
          {tierCounts.CERTIFIED > 0 && <>{tierCounts.CERTIFIED} Certified</>}
          {tierCounts.PUBLISHED > 0 && <>{tierCounts.CERTIFIED > 0 ? " · " : ""}{tierCounts.PUBLISHED} Published</>}
          {tierCounts.TEAM > 0 && <> · {tierCounts.TEAM} Team</>}
          {tierCounts.PERSONAL > 0 && <> · {tierCounts.PERSONAL} Personal</>}
        </div>
        {totalReports > 0 && (
          <div>
            <div className="flex h-2 rounded-full overflow-hidden">
              {barSegments.map((seg) => (
                <div
                  key={seg.key}
                  className={cn("transition-all", seg.color)}
                  style={{ width: `${(seg.count / totalReports) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-1.5">
              {barSegments.map((seg) => (
                <span key={seg.key} className="flex items-center gap-1 text-[10px] text-[#7d654e]/60">
                  <span className={cn("inline-block w-2 h-2 rounded-full", seg.color)} />
                  {seg.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    <div className="flex gap-6">
      {/* Folder sidebar */}
      <nav className="w-56 shrink-0">
        <div className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e8dfd4] bg-[#faf7f4]">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold">
              Report Groups
            </span>
          </div>
          <ul className="py-1">
            {FOLDERS.map((folder) => {
              const isActive = activeFolder === folder.key;
              const Icon = isActive ? FolderOpen : Folder;
              return (
                <li key={folder.key}>
                  <button
                    onClick={() => setActiveFolder(folder.key)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-[#eddece] text-[#7d654e] font-medium"
                        : "text-[#1a1510]/70 hover:bg-[#f7f3ef] hover:text-[#1a1510]"
                    )}
                  >
                    <Icon size={15} strokeWidth={1.8} className="shrink-0" />
                    <span className="flex-1 text-left">{folder.label}</span>
                    <span
                      className={cn(
                        "text-[11px] tabular-nums",
                        isActive ? "text-[#7d654e]" : "text-[#7d654e]/40"
                      )}
                    >
                      {folderCounts[folder.key]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Main report list */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight size={14} className="text-[#7d654e]/40" />
          <h2 className="text-sm font-semibold text-[#1a1510]">
            {FOLDERS.find((f) => f.key === activeFolder)?.label}
          </h2>
          <span className="text-xs text-[#7d654e]/60 tabular-nums">
            ({filtered.length} {filtered.length === 1 ? "report" : "reports"})
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-12 text-center">
            <Folder size={32} className="mx-auto text-[#7d654e]/30 mb-3" />
            <p className="text-sm text-[#7d654e]">No reports in this folder yet.</p>
            <p className="text-xs text-[#7d654e]/60 mt-1">
              Reports are organized here by your admin team.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8dfd4] bg-[#faf7f4]">
                  {["Name", "Base Template", "Tier", "Owner", "Last Modified"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold py-3 px-4",
                          i === 4 ? "text-right" : "text-left"
                        )}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-[#e8dfd4] last:border-b-0 transition-colors hover:bg-[#f7f3ef]"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/reports/${report.template.slug}`}
                        className="group/link text-sm font-medium text-[#1a1510] hover:text-[#7d654e] transition-colors inline-flex items-center gap-2"
                      >
                        <FileText
                          size={14}
                          className="text-[#7d654e] shrink-0"
                        />
                        <span>{report.name}</span>
                        <ArrowUpRight
                          size={12}
                          className="text-[#7d654e]/60 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0"
                        />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/reports/${report.template.slug}`}
                        className="text-sm text-[#7d654e] hover:text-[#7d654e]/80 transition-colors"
                      >
                        {report.template.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <PublicationTierBadge tier={report.tier} />
                        {report.tier.toUpperCase() === "CERTIFIED" && (
                          <ShieldCheck size={12} className="text-amber-600 shrink-0" />
                        )}
                      </div>
                      {report.tier.toUpperCase() === "CERTIFIED" && (
                        <div className="text-[10px] text-[#7d654e]/50 mt-0.5">
                          Certified by Sarah K., VP Analytics
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#7d654e]">
                      {formatOwner(report.ownerId, report.teamId)}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#7d654e] text-right tabular-nums">
                      {new Date(report.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
