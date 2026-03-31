"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PulseProperty,
  AgentStatus,
  LiveEvent,
  generateEvent,
  EVENT_COLORS,
  LEVEL_COLORS,
} from "@/lib/pulse-data";

interface Props {
  property: PulseProperty;
  onBack: () => void;
}

const HEALTH_DOT: Record<string, string> = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-red-400",
};

const DATA_SOURCES = [
  { name: "Entrata PMS", status: "live" as const, label: "Live" },
  { name: "Yardi GL", status: "stale" as const, label: "Mar 1" },
  { name: "Salesforce", status: "stale" as const, label: "2h ago" },
  { name: "CoStar", status: "stale" as const, label: "Feb 28" },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function AgentCard({ agent }: { agent: AgentStatus }) {
  const color = LEVEL_COLORS[agent.level] ?? "#6b7280";

  return (
    <div className="rounded-xl border border-[#1b2332] bg-[#0d1117] p-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-heading text-sm font-semibold text-[#e2e8f0]">
          {agent.name}
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] font-medium"
          style={{
            color,
            backgroundColor: `${color}18`,
            border: `1px solid ${color}30`,
          }}
        >
          {agent.level}
        </span>
      </div>

      {agent.level === "L4" && (
        <div className="mb-3 flex items-center gap-1.5">
          {Array.from({ length: Math.min(agent.activeCount, 16) }).map(
            (_, i) => (
              <span
                key={i}
                className="inline-block h-[7px] w-[7px] rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: "1.8s",
                }}
              />
            )
          )}
          {agent.activeCount > 16 && (
            <span
              className="font-mono text-[10px]"
              style={{ color }}
            >
              +{agent.activeCount - 16}
            </span>
          )}
        </div>
      )}

      {agent.level === "L3" && (
        <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-[#1b2332]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${Math.min(75 + Math.random() * 20, 95)}%`,
              backgroundColor: color,
            }}
          />
          <div className="shimmer-bar absolute inset-0 rounded-full" />
        </div>
      )}

      <div className="flex items-baseline justify-between">
        <span className="text-xs text-[#4a5568]">{agent.metric}</span>
        <span className="font-mono text-sm font-medium text-[#94a3b8]">
          {agent.metricValue}
        </span>
      </div>
    </div>
  );
}

function EventRow({ event, isNew }: { event: LiveEvent; isNew: boolean }) {
  const dotColor = EVENT_COLORS[event.type] ?? "#6b7280";

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-[#1b2332]/50 px-1 py-2.5 transition-all duration-500",
        isNew && "animate-event-in"
      )}
    >
      <span className="mt-0.5 shrink-0 font-mono text-[11px] text-[#4a5568]">
        {formatTime(event.timestamp)}
      </span>
      <span
        className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span className="flex-1 text-[13px] leading-snug text-[#94a3b8]">
        {event.description}
      </span>
      {event.aiInitiated && (
        <span className="mt-0.5 shrink-0 rounded bg-[#a855f7]/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-[#a855f7]">
          AI
        </span>
      )}
    </div>
  );
}

export function PropertyDetail({ property, onBack }: Props) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [newestId, setNewestId] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = Array.from({ length: 8 }, () =>
      generateEvent(property.id)
    );
    setEvents(initial);

    const interval = setInterval(() => {
      const evt = generateEvent(property.id);
      setNewestId(evt.id);
      setEvents((prev) => [evt, ...prev].slice(0, 20));
    }, 2000 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, [property.id]);

  const activeAgents = property.aiAgents.filter(
    (a) => a.status === "active"
  );
  const totalConversations = property.aiAgents.reduce(
    (sum, a) => sum + (a.level === "L4" ? a.activeCount : 0),
    0
  );

  const collectedAgent = property.aiAgents.find(
    (a) => a.type === "financial" && a.level === "L4"
  );
  const collectedValue = collectedAgent?.metricValue ?? "$0";

  const resolutionAgent = property.aiAgents.find(
    (a) => a.type === "maintenance" && a.level === "L4"
  );
  const resolutionValue = resolutionAgent?.metricValue ?? "—";

  return (
    <div className="relative flex h-full min-h-screen flex-col bg-[#06080d]">
      <style jsx>{`
        @keyframes eventIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-event-in {
          animation: eventIn 0.5s ease-out forwards;
        }
        .shimmer-bar {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#1b2332] bg-[#06080d]/90 px-6 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#4a5568] transition-colors hover:text-[#94a3b8]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portfolio</span>
        </button>

        <div className="mx-auto flex items-center gap-3">
          <h1 className="font-heading text-lg font-semibold text-[#e2e8f0]">
            {property.name}
          </h1>
          <span className="text-sm text-[#4a5568]">
            {property.city}, {property.state}
          </span>
          <span className="rounded-full border border-[#1b2332] bg-[#0d1117] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#94a3b8]">
            Class {property.classType}
          </span>
          <span className="font-mono text-sm text-[#4a5568]">
            {property.units} units
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-medium text-[#e2e8f0]">
            {property.occupancy}%
          </span>
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              HEALTH_DOT[property.health]
            )}
          />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex flex-1 gap-6 overflow-hidden px-6 pt-6 pb-20">
        {/* Left Column — Agents */}
        <div className="flex w-[60%] shrink-0 flex-col gap-6 overflow-y-auto pr-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[#4a5568]">
                Active AI Agents
              </h2>
              <span className="rounded-full bg-[#a855f7]/15 px-2 py-0.5 font-mono text-xs font-medium text-[#a855f7]">
                {activeAgents.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {property.aiAgents.map((agent, i) => (
                <AgentCard key={`${agent.name}-${i}`} agent={agent} />
              ))}
            </div>
          </div>

          {/* Connected Data Sources */}
          <div>
            <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-[#4a5568]">
              Connected Data Sources
            </h2>
            <div className="flex flex-wrap gap-3">
              {DATA_SOURCES.map((src) => (
                <div
                  key={src.name}
                  className="flex items-center gap-2 rounded-lg border border-[#1b2332] bg-[#0d1117] px-3 py-2"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      src.status === "live"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    )}
                  />
                  <span className="text-xs text-[#94a3b8]">{src.name}</span>
                  <span className="font-mono text-[10px] text-[#4a5568]">
                    {src.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Live Activity */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[#4a5568]">
              Live Activity
            </h2>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </div>

          <div
            ref={feedRef}
            className="flex-1 overflow-y-auto"
          >
            {events.map((evt) => (
              <EventRow
                key={evt.id}
                event={evt}
                isNew={evt.id === newestId}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ── Bottom Stats Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-center gap-6 border-t border-[#1b2332] bg-[#06080d]/90 px-6 backdrop-blur-md">
        <span className="text-sm text-[#4a5568]">
          <span className="font-mono text-[#94a3b8]">
            {activeAgents.length}
          </span>{" "}
          Active Agents
        </span>
        <span className="text-[#1b2332]">·</span>
        <span className="text-sm text-[#4a5568]">
          <span className="font-mono text-[#94a3b8]">
            {totalConversations}
          </span>{" "}
          Active Conversations
        </span>
        <span className="text-[#1b2332]">·</span>
        <span className="text-sm text-[#4a5568]">
          <span className="font-mono text-[#94a3b8]">{collectedValue}</span>{" "}
          Collected Today
        </span>
        <span className="text-[#1b2332]">·</span>
        <span className="text-sm text-[#4a5568]">
          <span className="font-mono text-[#94a3b8]">{resolutionValue}</span>{" "}
          Avg Resolution
        </span>
      </footer>
    </div>
  );
}
