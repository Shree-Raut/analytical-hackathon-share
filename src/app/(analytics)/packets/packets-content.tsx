"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Package,
  ChevronDown,
  ChevronRight,
  Calendar,
  Users,
  FileText,
  Clock,
  Circle,
  Plus,
  Mail,
} from "lucide-react";

interface PacketReport {
  name: string;
  templateSlug?: string;
}

interface Packet {
  id: string;
  name: string;
  description: string;
  reports: PacketReport[];
  schedule: {
    frequency: string;
    detail: string;
    time: string;
  };
  recipientCount: number;
  format: string;
  lastSent: string;
  status: "Active" | "Paused";
}

const MOCK_PACKETS: Packet[] = [
  {
    id: "pkt-1",
    name: "Q4 Owner Package",
    description:
      "Comprehensive financial and operations bundle for owner meetings",
    reports: [
      { name: "NOI Waterfall" },
      { name: "Trailing 12" },
      { name: "Rent Roll" },
      { name: "Variance Narrative" },
    ],
    schedule: {
      frequency: "Monthly",
      detail: "5th of month",
      time: "8:00 AM",
    },
    recipientCount: 3,
    format: "PDF with branding",
    lastSent: "2026-03-05T08:00:00Z",
    status: "Active",
  },
  {
    id: "pkt-2",
    name: "Weekly Ops Packet",
    description: "Operational performance snapshot for property managers",
    reports: [
      { name: "Box Score" },
      { name: "Delinquency Aging" },
      { name: "Leasing Funnel" },
      { name: "AI Performance" },
    ],
    schedule: {
      frequency: "Weekly",
      detail: "Monday",
      time: "7:00 AM",
    },
    recipientCount: 5,
    format: "PDF",
    lastSent: "2026-03-03T07:00:00Z",
    status: "Active",
  },
];

function StatusDot({ status }: { status: "Active" | "Paused" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium",
        status === "Active" ? "text-emerald-600" : "text-[#7d654e]/60"
      )}
    >
      <Circle
        size={7}
        fill="currentColor"
        className={status === "Active" ? "text-emerald-500" : "text-[#7d654e]/40"}
      />
      {status}
    </span>
  );
}

function PacketCard({ packet }: { packet: Packet }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <Package size={16} className="text-[#7d654e] shrink-0" />
              <h3 className="text-sm font-semibold text-[#1a1510]">
                {packet.name}
              </h3>
              <StatusDot status={packet.status} />
            </div>
            <p className="text-xs text-[#7d654e]/70 ml-[30px]">
              {packet.description}
            </p>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 mt-4 ml-[30px]">
          <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
            <FileText size={12} className="text-[#7d654e]/60" />
            <span className="font-medium">{packet.reports.length}</span> reports
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
            <Calendar size={12} className="text-[#7d654e]/60" />
            {packet.schedule.frequency} · {packet.schedule.detail},{" "}
            {packet.schedule.time}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
            <Mail size={12} className="text-[#7d654e]/60" />
            <span className="font-medium">{packet.recipientCount}</span>{" "}
            recipients
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#7d654e]">
            <Clock size={12} className="text-[#7d654e]/60" />
            Last sent{" "}
            {new Date(packet.lastSent).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
          <span className="text-[11px] text-[#7d654e]/50 border border-[#e8dfd4] rounded px-1.5 py-0.5">
            {packet.format}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mt-4 ml-[30px] text-xs font-medium text-[#7d654e] hover:text-[#1a1510] transition-colors"
        >
          {expanded ? (
            <ChevronDown size={13} />
          ) : (
            <ChevronRight size={13} />
          )}
          View Contents
        </button>
      </div>

      {/* Expanded report list */}
      {expanded && (
        <div className="border-t border-[#e8dfd4] bg-[#faf7f4] px-5 py-3">
          <div className="ml-[30px] space-y-2">
            {packet.reports.map((report, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-sm text-[#1a1510]"
              >
                <span className="w-5 h-5 rounded-full bg-white border border-[#e8dfd4] flex items-center justify-center text-[10px] font-medium text-[#7d654e] tabular-nums">
                  {i + 1}
                </span>
                {report.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PacketsContent() {
  const [tooltip, setTooltip] = useState(false);

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-[#7d654e] tabular-nums">
          {MOCK_PACKETS.length} packets configured
        </p>
        <div className="relative">
          <button
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#7d654e] hover:bg-[#7d654e]/90 text-white rounded-lg transition-colors"
          >
            <Plus size={13} />
            Create Packet
          </button>
          {tooltip && (
            <div className="absolute top-full mt-1 right-0 bg-[#1a1510] text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-10">
              Coming soon
            </div>
          )}
        </div>
      </div>

      {/* Packet cards */}
      <div className="space-y-4">
        {MOCK_PACKETS.map((packet) => (
          <PacketCard key={packet.id} packet={packet} />
        ))}
      </div>
    </div>
  );
}
