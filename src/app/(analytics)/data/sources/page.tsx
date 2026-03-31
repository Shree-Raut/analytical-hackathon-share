import { prisma } from "@/lib/db";
import { getActiveCustomerId } from "@/lib/customer-server";
import { PageHeader } from "@/components/analytics/page-header";
import { ExchangeDiscovery } from "@/components/analytics/exchange-discovery";
import {
  Database,
  FileSpreadsheet,
  Cloud,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DataSourceActions } from "./data-source-actions";

/* ─── Source metadata keyed by sourceType ─── */

const SOURCE_META: Record<
  string,
  {
    icon: typeof Database;
    iconBg: string;
    iconColor: string;
    typeBadge: string;
    tableCount: string;
    freshness: number; // 0-100
    lastSyncLabel: string;
    syncFreqLabel: string;
  }
> = {
  ENTRATA: {
    icon: Database,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    typeBadge: "bg-blue-50 text-blue-700",
    tableCount: "142 tables",
    freshness: 100,
    lastSyncLabel: "Real-time",
    syncFreqLabel: "Continuous",
  },
  YARDI_GL: {
    icon: FileSpreadsheet,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    typeBadge: "bg-purple-50 text-purple-700",
    tableCount: "8 tables",
    freshness: 85,
    lastSyncLabel: "5 days ago",
    syncFreqLabel: "Monthly",
  },
  API: {
    icon: Cloud,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    typeBadge: "bg-cyan-50 text-cyan-700",
    tableCount: "12 tables",
    freshness: 97,
    lastSyncLabel: "2 hours ago",
    syncFreqLabel: "Daily",
  },
};

const FALLBACK_META = {
  icon: Database,
  iconBg: "bg-gray-100",
  iconColor: "text-gray-600",
  typeBadge: "bg-gray-50 text-gray-700",
  tableCount: "—",
  freshness: 0,
  lastSyncLabel: "Unknown",
  syncFreqLabel: "—",
};

export default async function DataSourcesPage() {
  const customerId = await getActiveCustomerId();

  const dataSources = await prisma.dataSource.findMany({
    where: { customerId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Data Sources"
        description="Manage your connected data and discover new sources on the Exchange"
      />

      {/* ══════════════════════════════════════════════════════
          Section 1 — Your Connected Sources
          ══════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {dataSources.map((ds) => {
            const meta = SOURCE_META[ds.sourceType] ?? FALLBACK_META;
            const Icon = meta.icon;
            const isGreen = meta.freshness >= 90;
            const dotColor = isGreen ? "bg-emerald-500" : "bg-amber-500";
            const statusLabel = isGreen ? "Connected" : "Sync pending";
            const barColor = isGreen ? "bg-emerald-500" : "bg-amber-500";

            return (
              <div
                key={ds.id}
                className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm p-5 flex flex-col gap-4 hover:border-[#7d654e]/30 transition-colors"
              >
                {/* Top row: icon + info + settings */}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                      meta.iconBg
                    )}
                  >
                    <Icon size={20} className={meta.iconColor} />
                  </div>

                  {/* Center info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1a1510] truncate">
                      {ds.name}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mt-1",
                        meta.typeBadge
                      )}
                    >
                      {ds.sourceType.replace("_", " ")}
                    </span>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={cn("w-2 h-2 rounded-full", dotColor)} />
                      <span className="text-xs text-[#1a1510]">
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Settings */}
                  <button
                    title="Coming in a future release"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f7f3ef] text-[#7d654e] transition-colors shrink-0"
                  >
                    <Settings size={16} />
                  </button>
                </div>

                {/* Detail rows */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7d654e]">Last sync</span>
                    <span className="font-medium text-[#1a1510]">
                      {meta.lastSyncLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7d654e]">Sync frequency</span>
                    <span className="font-medium text-[#1a1510]">
                      {meta.syncFreqLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7d654e]">Tables</span>
                    <span className="font-medium text-[#1a1510]">
                      {meta.tableCount}
                    </span>
                  </div>
                </div>

                {/* View Schema + actions (client component) */}
                <DataSourceActions
                  sourceName={ds.name}
                  sourceType={ds.sourceType}
                  tableCount={meta.tableCount}
                />

                {/* Health bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#7d654e]">
                      Data freshness
                    </span>
                    <span className="text-[10px] font-medium text-[#1a1510]">
                      {meta.freshness}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#f7f3ef]">
                    <div
                      className={cn("h-1.5 rounded-full transition-all", barColor)}
                      style={{ width: `${meta.freshness}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary bar */}
        <div className="mt-4 rounded-xl border border-[#e8dfd4] bg-white px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7d654e]">
          <span className="font-semibold text-[#1a1510]">
            {dataSources.length} sources connected
          </span>
          <span className="w-px h-3 bg-[#e8dfd4]" />
          <span>162 total tables</span>
          <span className="w-px h-3 bg-[#e8dfd4]" />
          <span>24.2M records</span>
          <span className="w-px h-3 bg-[#e8dfd4]" />
          <span>Last full sync: 2 hours ago</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          Section 2 — Discover on the Exchange (client)
          ══════════════════════════════════════════════════════ */}
      <section>
        <ExchangeDiscovery />
      </section>
    </div>
  );
}
