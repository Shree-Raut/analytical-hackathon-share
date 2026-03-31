"use client";

import { useState, useMemo } from "react";
import { OBSERVATORY_NODES, type ObservatoryNode } from "@/lib/pulse-data";

interface Props {
  onBack: () => void;
}

const TIER_STYLE = {
  source: {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.4)",
    particle: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.25)",
  },
  metric: {
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.4)",
    particle: "#10b981",
    glow: "rgba(16, 185, 129, 0.25)",
  },
  report: {
    bg: "rgba(168, 85, 247, 0.15)",
    border: "rgba(168, 85, 247, 0.4)",
    particle: "#a855f7",
    glow: "rgba(168, 85, 247, 0.25)",
  },
} as const;

const GOLD = {
  border: "rgba(251, 191, 36, 0.6)",
  glow: "0 0 12px rgba(251, 191, 36, 0.15), 0 0 4px rgba(251, 191, 36, 0.1)",
};

// ViewBox scale factor: percentage × S = viewBox coordinate
const S = 10;
const VIEWBOX = `0 0 ${100 * S} ${100 * S}`;

export function DataObservatory({ onBack }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const nodeById = useMemo(() => {
    const m = new Map<string, ObservatoryNode>();
    for (const n of OBSERVATORY_NODES) m.set(n.id, n);
    return m;
  }, []);

  const tiers = useMemo(() => ({
    sources: OBSERVATORY_NODES.filter((n) => n.tier === "source"),
    metrics: OBSERVATORY_NODES.filter((n) => n.tier === "metric"),
    reports: OBSERVATORY_NODES.filter((n) => n.tier === "report"),
  }), []);

  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    const { sources, metrics, reports } = tiers;

    const layout = (
      nodes: ObservatoryNode[],
      xMin: number,
      xMax: number,
      yFn: number | ((i: number) => number),
    ) => {
      const gap = nodes.length > 1 ? (xMax - xMin) / (nodes.length - 1) : 0;
      nodes.forEach((n, i) => {
        pos.set(n.id, {
          x: xMin + gap * i,
          y: typeof yFn === "function" ? yFn(i) : yFn,
        });
      });
    };

    layout(sources, 12, 88, 76);
    layout(metrics, 4, 96, (i) => 44 + (i % 2) * 3);
    layout(reports, 10, 90, 18);

    return pos;
  }, [tiers]);

  const edges = useMemo(() => {
    const list: { from: string; to: string; tier: ObservatoryNode["tier"] }[] =
      [];
    for (const n of OBSERVATORY_NODES) {
      for (const t of n.connections) {
        if (nodeById.has(t)) list.push({ from: n.id, to: t, tier: n.tier });
      }
    }
    return list;
  }, [nodeById]);

  const particles = useMemo(() => {
    const count = Math.min(28, edges.length);
    const step = edges.length / count;
    return Array.from({ length: count }, (_, i) => {
      const e = edges[Math.floor(i * step)];
      const f = positions.get(e.from)!;
      const t = positions.get(e.to)!;
      return {
        fx: f.x,
        fy: f.y,
        dx: t.x - f.x,
        dy: t.y - f.y,
        dur: 3 + (i % 7) * 0.7,
        delay: (i * 0.41) % 7,
        color: TIER_STYLE[e.tier].particle,
      };
    });
  }, [edges, positions]);

  const connected = useMemo(() => {
    if (!hovered) return null;
    const s = new Set<string>([hovered]);
    for (const e of edges) {
      if (e.from === hovered || e.to === hovered) {
        s.add(e.from);
        s.add(e.to);
      }
    }
    return s;
  }, [hovered, edges]);

  const hovNode = hovered ? nodeById.get(hovered) : null;
  const hovPos = hovered ? positions.get(hovered) : null;

  function nodeSize(n: ObservatoryNode) {
    const base = n.tier === "source" ? 50 : n.tier === "metric" ? 42 : 46;
    return Math.round(base * (0.55 + n.size * 0.45));
  }

  function edgeOpacity(from: string, to: string) {
    if (!hovered) return 0.25;
    return from === hovered || to === hovered ? 0.85 : 0.04;
  }

  function edgeStroke(from: string, to: string) {
    if (!hovered) return "#1b2332";
    return from === hovered || to === hovered ? "rgba(255,255,255,0.7)" : "#1b2332";
  }

  function edgeWidth(from: string, to: string) {
    return hovered && (from === hovered || to === hovered) ? 1.5 : 0.8;
  }

  function nodeOpacity(id: string) {
    if (!hovered) return 1;
    return connected!.has(id) ? 1 : 0.12;
  }

  function floatDelay(id: string) {
    let h = 0;
    for (let i = 0; i < id.length; i++)
      h = (h * 31 + id.charCodeAt(i)) % 1000;
    return (h % 40) / 10;
  }

  return (
    <div className="fixed inset-0 bg-[#06080d] overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center gap-6 px-8 py-5 bg-gradient-to-b from-[#06080d] via-[#06080d]/80 to-transparent">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-pulse-muted hover:text-pulse-text transition-colors"
        >
          <span className="text-base">←</span>
          Back to Portfolio
        </button>
        <div className="h-5 w-px bg-pulse-border" />
        <div>
          <h1 className="text-lg font-heading font-semibold text-pulse-bright tracking-tight">
            Data Observatory
          </h1>
          <p className="text-[11px] text-pulse-muted mt-0.5">
            Your data infrastructure — sources, metrics, and reports
          </p>
        </div>
      </header>

      {/* Tier labels */}
      {(
        [
          ["Reports", "14%", "text-purple-500/40"],
          ["Metrics", "42%", "text-emerald-500/40"],
          ["Sources", "73%", "text-blue-500/40"],
        ] as const
      ).map(([label, top, cls]) => (
        <div
          key={label}
          className="absolute left-4 z-10 pointer-events-none"
          style={{ top }}
        >
          <span
            className={`text-[9px] font-mono uppercase tracking-[0.2em] ${cls}`}
          >
            {label}
          </span>
        </div>
      ))}

      {/* SVG: connection lines + particles */}
      <svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        viewBox={VIEWBOX}
        preserveAspectRatio="none"
      >
        {edges.map((e, i) => {
          const f = positions.get(e.from);
          const t = positions.get(e.to);
          if (!f || !t) return null;
          return (
            <line
              key={i}
              x1={f.x * S}
              y1={f.y * S}
              x2={t.x * S}
              y2={t.y * S}
              stroke={edgeStroke(e.from, e.to)}
              strokeWidth={edgeWidth(e.from, e.to)}
              opacity={edgeOpacity(e.from, e.to)}
              vectorEffect="non-scaling-stroke"
              style={{
                transition: "stroke 0.3s, opacity 0.3s, stroke-width 0.3s",
              }}
            />
          );
        })}

        <g
          style={{
            opacity: hovered ? 0.2 : 1,
            transition: "opacity 0.3s",
          }}
        >
          {particles.map((p, i) => (
            <circle
              key={i}
              cx={p.fx * S}
              cy={p.fy * S}
              r="3"
              fill={p.color}
            >
              <animateMotion
                path={`M 0 0 L ${p.dx * S} ${p.dy * S}`}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0.5;0"
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      </svg>

      {/* Nodes */}
      {OBSERVATORY_NODES.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const sz = nodeSize(node);
        const tier = TIER_STYLE[node.tier];
        const cert = node.certified;
        const isHov = hovered === node.id;

        return (
          <div
            key={node.id}
            className="absolute z-10 flex flex-col items-center"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: nodeOpacity(node.id),
              transition: "opacity 0.3s",
            }}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={`flex items-center justify-center cursor-pointer ${
                node.tier === "report" ? "rounded-lg" : "rounded-full"
              }`}
              style={{
                width: sz,
                height: sz,
                background: tier.bg,
                border: `1px solid ${cert ? GOLD.border : tier.border}`,
                boxShadow: cert
                  ? GOLD.glow
                  : isHov
                    ? `0 0 20px ${tier.glow}`
                    : "none",
                animation: `float 4s ease-in-out ${floatDelay(node.id)}s infinite`,
                transition: "box-shadow 0.3s",
              }}
            >
              {cert && (
                <span className="text-amber-400/70 text-[10px] select-none">
                  ✦
                </span>
              )}
            </div>
            <span
              className="mt-1 text-[10px] text-center leading-tight max-w-[70px] truncate select-none"
              style={{
                color: isHov ? "#e2e8f0" : "#4a5568",
                transition: "color 0.3s",
              }}
            >
              {node.label}
            </span>
          </div>
        );
      })}

      {/* Tooltip */}
      {hovNode && hovPos && <Tooltip node={hovNode} pos={hovPos} />}

      {/* Stats bar */}
      <footer className="absolute bottom-0 inset-x-0 z-20 py-4 text-center bg-gradient-to-t from-[#06080d] via-[#06080d]/80 to-transparent">
        <p className="text-sm text-pulse-muted">
          {(
            [
              ["98", "metric definitions"],
              ["42", "report templates"],
              ["6", "data sources"],
              ["847", "queries today"],
              ["99.2%", "data freshness"],
            ] as const
          ).map(([num, label], i) => (
            <span key={i}>
              {i > 0 && <span className="mx-2 text-pulse-border">·</span>}
              <span className="font-mono text-pulse-text">{num}</span> {label}
            </span>
          ))}
        </p>
      </footer>
    </div>
  );
}

function Tooltip({
  node,
  pos,
}: {
  node: ObservatoryNode;
  pos: { x: number; y: number };
}) {
  const above = pos.y > 30;

  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: `${Math.min(Math.max(pos.x, 12), 88)}%`,
        top: above ? `${pos.y - 5}%` : `${pos.y + 5}%`,
        transform: above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
      }}
    >
      <div className="bg-pulse-surface/95 border border-pulse-border rounded-lg px-4 py-3 backdrop-blur-sm min-w-[170px] animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-heading font-semibold text-pulse-bright">
            {node.label}
          </span>
          {node.certified && (
            <span className="text-[8px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded tracking-wider">
              CERTIFIED
            </span>
          )}
        </div>
        <div className="space-y-1">
          {node.tier === "source" && node.meta && (
            <>
              <MetaRow label="Tables" value={String(node.meta.tables)} />
              <MetaRow label="Status" value={String(node.meta.status)} />
              <MetaRow label="Freshness" value={String(node.meta.freshness)} />
            </>
          )}
          {node.tier === "metric" && node.meta && (
            <>
              <MetaRow label="Queries" value={String(node.meta.queries)} />
              <MetaRow label="Reports" value={String(node.meta.reports)} />
              <MetaRow
                label="Certified"
                value={node.certified ? "Yes" : "No"}
              />
            </>
          )}
          {node.tier === "report" && node.meta && (
            <>
              <MetaRow label="Views" value={String(node.meta.views)} />
              <MetaRow label="Customers" value={String(node.meta.customers)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[10px]">
      <span className="text-pulse-muted">{label}</span>
      <span className="font-mono text-pulse-text">{value}</span>
    </div>
  );
}
