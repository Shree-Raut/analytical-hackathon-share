"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";
import {
  HUD_INITIAL,
  EVENT_COLORS,
  CUSTOMER_HQ,
  type PulseProperty,
} from "@/lib/pulse-data";

const MapInner = dynamic(() => import("./map-inner"), { ssr: false });
const BUILD_STAMP = "scale-1k";
const BUILD_TIME = "2026-03-07 00:45 UTC";

interface Props {
  properties: PulseProperty[];
  onPropertyClick: (property: PulseProperty) => void;
  onObservatoryClick: () => void;
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function AnimatedCounter({ value, format }: {
  value: number;
  format?: "currency" | "number";
}) {
  const [display, setDisplay] = useState(value);
  const targetRef = useRef(value);

  useEffect(() => { targetRef.current = value; }, [value]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay((prev) => {
        const target = targetRef.current;
        if (prev === target) return prev;
        const diff = target - prev;
        const step = Math.max(1, Math.abs(Math.ceil(diff * 0.15)));
        return diff > 0 ? Math.min(prev + step, target) : Math.max(prev - step, target);
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const formatted = format === "currency" ? formatCurrency(display) : display.toLocaleString();
  return <span className="font-mono tabular-nums">{formatted}</span>;
}

function HUDCounters() {
  const [stats, setStats] = useState(HUD_INITIAL);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        aiConversations: prev.aiConversations + Math.floor(Math.random() * 5) - 1,
        collectedToday: prev.collectedToday + Math.floor(Math.random() * 800),
        toursScheduled: prev.toursScheduled + (Math.random() > 0.7 ? 1 : 0),
        leasesSigned: prev.leasesSigned + (Math.random() > 0.85 ? 1 : 0),
        workOrdersResolved: prev.workOrdersResolved + (Math.random() > 0.75 ? 1 : 0),
        aiHoursSaved: prev.aiHoursSaved + (Math.random() > 0.6 ? 1 : 0),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { value: stats.aiConversations, label: "active AI agent conversations" },
    { value: stats.collectedToday, label: "collected today", format: "currency" as const },
    { value: stats.toursScheduled, label: "tours scheduled" },
    { value: stats.leasesSigned, label: "leases signed today" },
    { value: stats.workOrdersResolved, label: "work orders resolved" },
    { value: stats.aiHoursSaved, label: "hours saved by AI agents this month" },
  ];

  const activityStreams = [
    { color: EVENT_COLORS.leasing, label: "Leasing" },
    { color: EVENT_COLORS.financial, label: "Financial" },
    { color: EVENT_COLORS.maintenance, label: "Maintenance" },
    { color: EVENT_COLORS.ai, label: "AI Decision" },
    { color: EVENT_COLORS.resident, label: "Resident" },
  ];

  return (
    <div className="absolute top-6 left-6 z-20 animate-fade-in-up rounded-2xl bg-[#0a0e17]/70 backdrop-blur-md border border-white/[0.06] px-7 py-6" style={{ maxWidth: 420 }}>
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#8b95a5] mb-5 font-semibold">
        Right now across your portfolio
      </p>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline gap-4">
            <span className="text-[28px] font-bold text-white min-w-[90px]" style={{ textShadow: "0 0 30px rgba(255,255,255,0.12)" }}>
              <AnimatedCounter value={item.value} format={item.format} />
            </span>
            <span className="text-[13px] text-[#8b95a5] font-medium tracking-wide">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Activity streams legend */}
      <div className="mt-6 pt-5 border-t border-white/[0.08]">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#8b95a5]/60 mb-3 font-semibold">
          Activity streams
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {activityStreams.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="shrink-0" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}80` }} />
              <span className="text-[11px] text-[#8b95a5]/80 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BottomBar({ properties }: { properties: PulseProperty[] }) {
  const healthyCt = properties.filter((p) => p.health === "healthy").length;
  const warningCt = properties.filter((p) => p.health === "warning").length;
  const criticalCt = properties.filter((p) => p.health === "critical").length;
  const totalUnits = properties.reduce((s, p) => s + p.units, 0);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-5 bg-[#0a0e17]/85 border border-[#1e293b] rounded-full px-7 py-3 backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <div className="shrink-0" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#38bdf8", boxShadow: "0 0 8px rgba(56,189,248,0.5)" }} />
        <span className="text-[13px] font-mono font-semibold text-white/90">{healthyCt}</span>
        <span className="text-[11px] text-[#8b95a5] font-medium">on track</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="shrink-0" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#fb923c", boxShadow: "0 0 8px rgba(251,146,60,0.5)" }} />
        <span className="text-[13px] font-mono font-semibold text-white/90">{warningCt}</span>
        <span className="text-[11px] text-[#8b95a5] font-medium">attention</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="shrink-0" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f43f5e", boxShadow: "0 0 8px rgba(244,63,94,0.5)" }} />
        <span className="text-[13px] font-mono font-semibold text-white/90">{criticalCt}</span>
        <span className="text-[11px] text-[#8b95a5] font-medium">critical</span>
      </div>
      <div className="w-px h-4 bg-[#1e293b]" />
      <span className="text-[12px] text-[#8b95a5] font-medium">
        {properties.length.toLocaleString()} properties · {totalUnits.toLocaleString()} units
      </span>
    </div>
  );
}

export function PlatformMap({ properties, onPropertyClick, onObservatoryClick }: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* MapLibre map + markers + particles (client-only) */}
      <MapInner
        properties={properties}
        onPropertyClick={onPropertyClick}
        onObservatoryClick={onObservatoryClick}
      />

      {/* HUD Counters + Activity Streams (left rail) */}
      <HUDCounters />

      {/* Bottom bar: health counts + portfolio stats */}
      <BottomBar properties={properties} />

      {/* Branding */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-2.5 animate-fade-in-up">
        <Activity className="w-4 h-4 text-[#38bdf8]/70" />
        <span className="text-sm font-heading font-bold text-white/90 tracking-wider uppercase">Platform Pulse</span>
      </div>
    </div>
  );
}
