"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface SectionColumn {
  key: string;
  label: string;
  format?: "currency" | "percent" | "number" | "text" | "date";
  align?: "left" | "right";
  width?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  subtitle?: string;
  columns: SectionColumn[];
  data: Record<string, any>[];
  collapsed?: boolean;
  totalRow?: Record<string, any>;
  layout?: "full" | "half";
}

export interface MultiSectionRendererProps {
  title: string;
  sections: ReportSection[];
  className?: string;
}

/* ─── Formatting ─────────────────────────────────────────────────────────── */

function formatCell(value: any, format?: SectionColumn["format"]): string {
  if (value == null || value === "") return "—";
  switch (format) {
    case "currency": {
      if (typeof value !== "number") return String(value);
      const abs = Math.abs(value);
      const formatted = abs.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return value < 0 ? `($${formatted})` : `$${formatted}`;
    }
    case "percent": {
      if (typeof value !== "number") return String(value);
      return `${value.toFixed(1)}%`;
    }
    case "number": {
      if (typeof value !== "number") return String(value);
      return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
    }
    case "date": {
      if (value instanceof Date) {
        return value.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        });
      }
      return String(value);
    }
    default:
      return String(value);
  }
}

function itemLabel(count: number): string {
  return count === 1 ? "1 item" : `${count} items`;
}

/* ─── Section Table ──────────────────────────────────────────────────────── */

function SectionTable({
  section,
  isCollapsed,
  onToggle,
}: {
  section: ReportSection;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const rowCount = section.data.length;

  return (
    <div className="rounded-xl border border-[#e8dfd4] bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-3 bg-[#faf7f4] flex justify-between items-center cursor-pointer hover:bg-[#f7f3ef] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {isCollapsed ? (
            <ChevronRight size={14} className="text-[#7d654e] shrink-0" />
          ) : (
            <ChevronDown size={14} className="text-[#7d654e] shrink-0" />
          )}
          <div className="text-left">
            <span className="text-sm font-semibold text-[#1a1510]">
              {section.title}
            </span>
            {section.subtitle && (
              <span className="ml-2 text-xs text-[#7d654e]">
                {section.subtitle}
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-full px-2.5 py-0.5 tabular-nums">
          {rowCount} {rowCount === 1 ? "property" : "properties"}
        </span>
      </button>

      {/* Table content */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#faf7f4] border-t border-b border-[#e8dfd4]">
                {section.columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "text-[10px] uppercase tracking-[0.15em] text-[#7d654e] font-semibold px-4 py-2.5 whitespace-nowrap",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9e0]">
              {section.data.map((row, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-[#f7f3ef]"
                >
                  {section.columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "text-sm text-[#1a1510] px-4 py-2.5 tabular-nums whitespace-nowrap",
                        col.align === "right" && "text-right"
                      )}
                    >
                      {formatCell(row[col.key], col.format)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total / summary row */}
              {section.totalRow && (
                <tr className="border-t-2 border-[#1a1510] bg-[#faf7f4]">
                  {section.columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "text-sm font-bold text-[#1a1510] px-4 py-2.5 tabular-nums whitespace-nowrap",
                        col.align === "right" && "text-right"
                      )}
                    >
                      {formatCell(section.totalRow![col.key], col.format)}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function MultiSectionRenderer({
  title,
  sections,
  className,
}: MultiSectionRendererProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const s of sections) {
      if (s.collapsed) initial.add(s.id);
    }
    return initial;
  });

  const toggleSection = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const groups = groupSections(sections);

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group, gi) => {
        if (group.type === "full") {
          const s = group.sections[0];
          return (
            <SectionTable
              key={s.id}
              section={s}
              isCollapsed={collapsedIds.has(s.id)}
              onToggle={() => toggleSection(s.id)}
            />
          );
        }

        return (
          <div key={`half-${gi}`} className="grid grid-cols-2 gap-4">
            {group.sections.map((s) => (
              <SectionTable
                key={s.id}
                section={s}
                isCollapsed={collapsedIds.has(s.id)}
                onToggle={() => toggleSection(s.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Layout Grouping ────────────────────────────────────────────────────── */

type SectionGroup =
  | { type: "full"; sections: [ReportSection] }
  | { type: "half"; sections: ReportSection[] };

function groupSections(sections: ReportSection[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  let halfBuffer: ReportSection[] = [];

  for (const s of sections) {
    if (s.layout === "half") {
      halfBuffer.push(s);
      if (halfBuffer.length === 2) {
        groups.push({ type: "half", sections: [...halfBuffer] });
        halfBuffer = [];
      }
    } else {
      if (halfBuffer.length > 0) {
        groups.push({ type: "half", sections: [...halfBuffer] });
        halfBuffer = [];
      }
      groups.push({ type: "full", sections: [s] });
    }
  }

  if (halfBuffer.length > 0) {
    groups.push({ type: "half", sections: halfBuffer });
  }

  return groups;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Box Score Report (8 Greystar properties)
   ═══════════════════════════════════════════════════════════════════════════ */

const PROPERTIES = [
  { name: "The Meridian",       units: 312 },
  { name: "Liberty Square",     units: 186 },
  { name: "Heritage Oaks",      units: 220 },
  { name: "Riverside Commons",  units: 280 },
  { name: "Magnolia Station",   units: 264 },
  { name: "Harbor Point",       units: 248 },
  { name: "Cascade Ridge",      units: 164 },
  { name: "Skyline Tower",      units: 156 },
];

const TOTAL_UNITS = PROPERTIES.reduce((s, p) => s + p.units, 0);

/* ── Section 1: Availability ──────────────────────────────────────────── */

const availabilityCols: SectionColumn[] = [
  { key: "property",     label: "Property",            align: "left" },
  { key: "unitType",     label: "Unit Type",           align: "left" },
  { key: "totalUnits",   label: "Total Units",         align: "right", format: "number" },
  { key: "occupied",     label: "Occupied",            align: "right", format: "number" },
  { key: "vacUnrented",  label: "Vacant (Unrented)",   align: "right", format: "number" },
  { key: "vacRented",    label: "Vacant (Rented)",     align: "right", format: "number" },
  { key: "modelAdmin",   label: "Model/Admin",         align: "right", format: "number" },
  { key: "totalVacant",  label: "Total Vacant",        align: "right", format: "number" },
  { key: "occPct",       label: "Occ%",                align: "right", format: "percent" },
  { key: "leasedPct",    label: "Leased%",             align: "right", format: "percent" },
];

const availabilityData = [
  { property: "The Meridian",      unitType: "Mixed (1-3 BR)", totalUnits: 312, occupied: 295, vacUnrented: 8,  vacRented: 5, modelAdmin: 4, totalVacant: 17, occPct: 94.6, leasedPct: 96.2 },
  { property: "Liberty Square",    unitType: "Mixed (1-2 BR)", totalUnits: 186, occupied: 178, vacUnrented: 4,  vacRented: 2, modelAdmin: 2, totalVacant: 8,  occPct: 95.7, leasedPct: 96.8 },
  { property: "Heritage Oaks",     unitType: "Mixed (1-3 BR)", totalUnits: 220, occupied: 207, vacUnrented: 6,  vacRented: 4, modelAdmin: 3, totalVacant: 13, occPct: 94.1, leasedPct: 95.9 },
  { property: "Riverside Commons", unitType: "Mixed (1-2 BR)", totalUnits: 280, occupied: 270, vacUnrented: 3,  vacRented: 4, modelAdmin: 3, totalVacant: 10, occPct: 96.4, leasedPct: 97.9 },
  { property: "Magnolia Station",  unitType: "Mixed (1-3 BR)", totalUnits: 264, occupied: 249, vacUnrented: 7,  vacRented: 5, modelAdmin: 3, totalVacant: 15, occPct: 94.3, leasedPct: 96.2 },
  { property: "Harbor Point",      unitType: "Mixed (S-2 BR)", totalUnits: 248, occupied: 236, vacUnrented: 5,  vacRented: 4, modelAdmin: 3, totalVacant: 12, occPct: 95.2, leasedPct: 96.8 },
  { property: "Cascade Ridge",     unitType: "Mixed (1-2 BR)", totalUnits: 164, occupied: 154, vacUnrented: 5,  vacRented: 3, modelAdmin: 2, totalVacant: 10, occPct: 93.9, leasedPct: 95.7 },
  { property: "Skyline Tower",     unitType: "Mixed (S-2 BR)", totalUnits: 156, occupied: 149, vacUnrented: 3,  vacRented: 2, modelAdmin: 2, totalVacant: 7,  occPct: 95.5, leasedPct: 96.8 },
];

const availabilityTotal = {
  property: "Portfolio Total",
  unitType: "",
  totalUnits: TOTAL_UNITS,
  occupied: availabilityData.reduce((s, r) => s + r.occupied, 0),
  vacUnrented: availabilityData.reduce((s, r) => s + r.vacUnrented, 0),
  vacRented: availabilityData.reduce((s, r) => s + r.vacRented, 0),
  modelAdmin: availabilityData.reduce((s, r) => s + r.modelAdmin, 0),
  totalVacant: availabilityData.reduce((s, r) => s + r.totalVacant, 0),
  occPct: parseFloat(
    (
      availabilityData.reduce((s, r) => s + r.occPct * r.totalUnits, 0) /
      TOTAL_UNITS
    ).toFixed(1)
  ),
  leasedPct: parseFloat(
    (
      availabilityData.reduce((s, r) => s + r.leasedPct * r.totalUnits, 0) /
      TOTAL_UNITS
    ).toFixed(1)
  ),
};

/* ── Section 2: Pricing ───────────────────────────────────────────────── */

const pricingCols: SectionColumn[] = [
  { key: "property",      label: "Property",           align: "left" },
  { key: "avgMarketRent", label: "Avg Market Rent",    align: "right", format: "currency" },
  { key: "avgEffRent",    label: "Avg Effective Rent",  align: "right", format: "currency" },
  { key: "avgRentPsf",    label: "Avg Rent PSF",       align: "right", format: "currency" },
  { key: "ltlDollar",     label: "Loss to Lease ($)",  align: "right", format: "currency" },
  { key: "ltlPct",        label: "Loss to Lease (%)",  align: "right", format: "percent" },
];

const pricingData = [
  { property: "The Meridian",      avgMarketRent: 2185, avgEffRent: 2126, avgRentPsf: 2.41, ltlDollar: -18408, ltlPct: -2.7 },
  { property: "Liberty Square",    avgMarketRent: 1645, avgEffRent: 1608, avgRentPsf: 1.92, ltlDollar: -6882,  ltlPct: -2.2 },
  { property: "Heritage Oaks",     avgMarketRent: 1780, avgEffRent: 1731, avgRentPsf: 1.85, ltlDollar: -10780, ltlPct: -2.8 },
  { property: "Riverside Commons", avgMarketRent: 2040, avgEffRent: 1992, avgRentPsf: 2.28, ltlDollar: -13440, ltlPct: -2.4 },
  { property: "Magnolia Station",  avgMarketRent: 1560, avgEffRent: 1518, avgRentPsf: 1.71, ltlDollar: -11088, ltlPct: -2.7 },
  { property: "Harbor Point",      avgMarketRent: 2340, avgEffRent: 2284, avgRentPsf: 2.65, ltlDollar: -13888, ltlPct: -2.4 },
  { property: "Cascade Ridge",     avgMarketRent: 1890, avgEffRent: 1842, avgRentPsf: 2.08, ltlDollar: -7872,  ltlPct: -2.5 },
  { property: "Skyline Tower",     avgMarketRent: 2410, avgEffRent: 2351, avgRentPsf: 2.78, ltlDollar: -9204,  ltlPct: -2.4 },
];

const pricingTotal = {
  property: "Portfolio Avg",
  avgMarketRent: Math.round(pricingData.reduce((s, r) => s + r.avgMarketRent, 0) / pricingData.length),
  avgEffRent: Math.round(pricingData.reduce((s, r) => s + r.avgEffRent, 0) / pricingData.length),
  avgRentPsf: parseFloat((pricingData.reduce((s, r) => s + r.avgRentPsf, 0) / pricingData.length).toFixed(2)),
  ltlDollar: pricingData.reduce((s, r) => s + r.ltlDollar, 0),
  ltlPct: parseFloat((pricingData.reduce((s, r) => s + r.ltlPct, 0) / pricingData.length).toFixed(1)),
};

/* ── Section 3: Lead Activity (half) ──────────────────────────────────── */

const leadCols: SectionColumn[] = [
  { key: "property",      label: "Property",       align: "left" },
  { key: "newLeads",      label: "New Leads",      align: "right", format: "number" },
  { key: "tours",         label: "Tours",          align: "right", format: "number" },
  { key: "appsStarted",   label: "Apps Started",   align: "right", format: "number" },
  { key: "appsCompleted", label: "Apps Completed", align: "right", format: "number" },
];

const leadData = [
  { property: "The Meridian",      newLeads: 142, tours: 68, appsStarted: 34, appsCompleted: 28 },
  { property: "Liberty Square",    newLeads: 87,  tours: 41, appsStarted: 22, appsCompleted: 18 },
  { property: "Heritage Oaks",     newLeads: 106, tours: 52, appsStarted: 27, appsCompleted: 21 },
  { property: "Riverside Commons", newLeads: 128, tours: 63, appsStarted: 31, appsCompleted: 26 },
  { property: "Magnolia Station",  newLeads: 118, tours: 55, appsStarted: 29, appsCompleted: 23 },
  { property: "Harbor Point",      newLeads: 155, tours: 72, appsStarted: 38, appsCompleted: 31 },
  { property: "Cascade Ridge",     newLeads: 74,  tours: 36, appsStarted: 18, appsCompleted: 14 },
  { property: "Skyline Tower",     newLeads: 98,  tours: 46, appsStarted: 24, appsCompleted: 19 },
];

const leadTotal = {
  property: "Total",
  newLeads: leadData.reduce((s, r) => s + r.newLeads, 0),
  tours: leadData.reduce((s, r) => s + r.tours, 0),
  appsStarted: leadData.reduce((s, r) => s + r.appsStarted, 0),
  appsCompleted: leadData.reduce((s, r) => s + r.appsCompleted, 0),
};

/* ── Section 4: Lease Activity (half) ─────────────────────────────────── */

const leaseCols: SectionColumn[] = [
  { key: "property",      label: "Property",       align: "left" },
  { key: "leasesSigned",  label: "Leases Signed",  align: "right", format: "number" },
  { key: "moveIns",       label: "Move-Ins",       align: "right", format: "number" },
  { key: "moveOuts",      label: "Move-Outs",      align: "right", format: "number" },
  { key: "net",           label: "Net",            align: "right", format: "number" },
  { key: "renewals",      label: "Renewals",       align: "right", format: "number" },
];

const leaseData = [
  { property: "The Meridian",      leasesSigned: 24, moveIns: 18, moveOuts: 14, net: 4,  renewals: 22 },
  { property: "Liberty Square",    leasesSigned: 15, moveIns: 12, moveOuts: 9,  net: 3,  renewals: 14 },
  { property: "Heritage Oaks",     leasesSigned: 18, moveIns: 14, moveOuts: 12, net: 2,  renewals: 16 },
  { property: "Riverside Commons", leasesSigned: 22, moveIns: 17, moveOuts: 11, net: 6,  renewals: 20 },
  { property: "Magnolia Station",  leasesSigned: 20, moveIns: 15, moveOuts: 13, net: 2,  renewals: 18 },
  { property: "Harbor Point",      leasesSigned: 26, moveIns: 20, moveOuts: 15, net: 5,  renewals: 19 },
  { property: "Cascade Ridge",     leasesSigned: 12, moveIns: 9,  moveOuts: 8,  net: 1,  renewals: 11 },
  { property: "Skyline Tower",     leasesSigned: 16, moveIns: 12, moveOuts: 10, net: 2,  renewals: 13 },
];

const leaseTotal = {
  property: "Total",
  leasesSigned: leaseData.reduce((s, r) => s + r.leasesSigned, 0),
  moveIns: leaseData.reduce((s, r) => s + r.moveIns, 0),
  moveOuts: leaseData.reduce((s, r) => s + r.moveOuts, 0),
  net: leaseData.reduce((s, r) => s + r.net, 0),
  renewals: leaseData.reduce((s, r) => s + r.renewals, 0),
};

/* ── Section 5: Make Ready Status (half) ──────────────────────────────── */

const makeReadyCols: SectionColumn[] = [
  { key: "property",     label: "Property",         align: "left" },
  { key: "vacReady",     label: "Vacant Ready",     align: "right", format: "number" },
  { key: "vacNotReady",  label: "Vacant Not Ready",  align: "right", format: "number" },
  { key: "readyPct",     label: "Ready%",           align: "right", format: "percent" },
  { key: "avgDays",      label: "Avg Days",         align: "right", format: "number" },
];

const makeReadyData = [
  { property: "The Meridian",      vacReady: 9,  vacNotReady: 8,  readyPct: 52.9, avgDays: 6.2 },
  { property: "Liberty Square",    vacReady: 5,  vacNotReady: 3,  readyPct: 62.5, avgDays: 4.8 },
  { property: "Heritage Oaks",     vacReady: 7,  vacNotReady: 6,  readyPct: 53.8, avgDays: 7.1 },
  { property: "Riverside Commons", vacReady: 7,  vacNotReady: 3,  readyPct: 70.0, avgDays: 4.3 },
  { property: "Magnolia Station",  vacReady: 8,  vacNotReady: 7,  readyPct: 53.3, avgDays: 6.8 },
  { property: "Harbor Point",      vacReady: 8,  vacNotReady: 4,  readyPct: 66.7, avgDays: 5.1 },
  { property: "Cascade Ridge",     vacReady: 6,  vacNotReady: 4,  readyPct: 60.0, avgDays: 5.9 },
  { property: "Skyline Tower",     vacReady: 4,  vacNotReady: 3,  readyPct: 57.1, avgDays: 5.4 },
];

const makeReadyTotal = {
  property: "Total",
  vacReady: makeReadyData.reduce((s, r) => s + r.vacReady, 0),
  vacNotReady: makeReadyData.reduce((s, r) => s + r.vacNotReady, 0),
  readyPct: parseFloat(
    (
      makeReadyData.reduce((s, r) => s + r.vacReady, 0) /
      (makeReadyData.reduce((s, r) => s + r.vacReady, 0) +
        makeReadyData.reduce((s, r) => s + r.vacNotReady, 0)) *
      100
    ).toFixed(1)
  ),
  avgDays: parseFloat(
    (makeReadyData.reduce((s, r) => s + r.avgDays, 0) / makeReadyData.length).toFixed(1)
  ),
};

/* ── Section 6: Exposure (half) ───────────────────────────────────────── */

const exposureCols: SectionColumn[] = [
  { key: "property",      label: "Property",        align: "left" },
  { key: "ntvRented",     label: "NTV (Rented)",    align: "right", format: "number" },
  { key: "ntvUnrented",   label: "NTV (Unrented)",  align: "right", format: "number" },
  { key: "exposureUnits", label: "Exposure Units",  align: "right", format: "number" },
  { key: "exposurePct",   label: "Exposure%",       align: "right", format: "percent" },
];

const exposureData = [
  { property: "The Meridian",      ntvRented: 5,  ntvUnrented: 8,  exposureUnits: 21, exposurePct: 6.7 },
  { property: "Liberty Square",    ntvRented: 3,  ntvUnrented: 4,  exposureUnits: 10, exposurePct: 5.4 },
  { property: "Heritage Oaks",     ntvRented: 4,  ntvUnrented: 6,  exposureUnits: 16, exposurePct: 7.3 },
  { property: "Riverside Commons", ntvRented: 6,  ntvUnrented: 3,  exposureUnits: 12, exposurePct: 4.3 },
  { property: "Magnolia Station",  ntvRented: 5,  ntvUnrented: 7,  exposureUnits: 19, exposurePct: 7.2 },
  { property: "Harbor Point",      ntvRented: 4,  ntvUnrented: 5,  exposureUnits: 15, exposurePct: 6.0 },
  { property: "Cascade Ridge",     ntvRented: 3,  ntvUnrented: 5,  exposureUnits: 12, exposurePct: 7.3 },
  { property: "Skyline Tower",     ntvRented: 2,  ntvUnrented: 3,  exposureUnits: 8,  exposurePct: 5.1 },
];

const exposureTotal = {
  property: "Total",
  ntvRented: exposureData.reduce((s, r) => s + r.ntvRented, 0),
  ntvUnrented: exposureData.reduce((s, r) => s + r.ntvUnrented, 0),
  exposureUnits: exposureData.reduce((s, r) => s + r.exposureUnits, 0),
  exposurePct: parseFloat(
    (
      exposureData.reduce((s, r) => s + r.exposureUnits * r.exposurePct, 0) /
      exposureData.reduce((s, r) => s + r.exposureUnits, 0)
    ).toFixed(1)
  ),
};

/* ── Assembled Box Score ──────────────────────────────────────────────── */

export const BOX_SCORE_MOCK_DATA: ReportSection[] = [
  {
    id: "availability",
    title: "Availability",
    subtitle: "Current month snapshot",
    columns: availabilityCols,
    data: availabilityData,
    totalRow: availabilityTotal,
    layout: "full",
  },
  {
    id: "pricing",
    title: "Pricing",
    subtitle: "Effective rents & loss to lease",
    columns: pricingCols,
    data: pricingData,
    totalRow: pricingTotal,
    layout: "full",
  },
  {
    id: "lead-activity",
    title: "Lead Activity",
    subtitle: "Month to date",
    columns: leadCols,
    data: leadData,
    totalRow: leadTotal,
    layout: "half",
  },
  {
    id: "lease-activity",
    title: "Lease Activity",
    subtitle: "Month to date",
    columns: leaseCols,
    data: leaseData,
    totalRow: leaseTotal,
    layout: "half",
  },
  {
    id: "make-ready",
    title: "Make Ready Status",
    columns: makeReadyCols,
    data: makeReadyData,
    totalRow: makeReadyTotal,
    layout: "half",
  },
  {
    id: "exposure",
    title: "Exposure",
    subtitle: "60-day forward",
    columns: exposureCols,
    data: exposureData,
    totalRow: exposureTotal,
    layout: "half",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Daily Operations Report (Mon–Sun sample week)
   ═══════════════════════════════════════════════════════════════════════════ */

const WEEK_DATES = [
  { date: "Mar 3", day: "Mon" },
  { date: "Mar 4", day: "Tue" },
  { date: "Mar 5", day: "Wed" },
  { date: "Mar 6", day: "Thu" },
  { date: "Mar 7", day: "Fri" },
  { date: "Mar 8", day: "Sat" },
  { date: "Mar 9", day: "Sun" },
];

/* ── Daily Ops Section 1: Income Budget ───────────────────────────────── */

const incomeBudgetCols: SectionColumn[] = [
  { key: "date",       label: "Date",         align: "left" },
  { key: "day",        label: "Day",          align: "left" },
  { key: "deposit",    label: "Deposit",      align: "right", format: "currency" },
  { key: "pctOfGoal",  label: "% of Goal",    align: "right", format: "percent" },
  { key: "lateCount",  label: "# Late Rent",  align: "right", format: "number" },
  { key: "lateDollar", label: "$ Late Rent",  align: "right", format: "currency" },
];

const incomeBudgetData = [
  { date: "Mar 3", day: "Mon", deposit: 842500, pctOfGoal: 53.2, lateCount: 142, lateDollar: 287400 },
  { date: "Mar 4", day: "Tue", deposit: 318200, pctOfGoal: 73.3, lateCount: 108, lateDollar: 218700 },
  { date: "Mar 5", day: "Wed", deposit: 156800, pctOfGoal: 83.2, lateCount: 86,  lateDollar: 174200 },
  { date: "Mar 6", day: "Thu", deposit: 98400,  pctOfGoal: 89.4, lateCount: 71,  lateDollar: 143800 },
  { date: "Mar 7", day: "Fri", deposit: 64200,  pctOfGoal: 93.5, lateCount: 58,  lateDollar: 117400 },
  { date: "Mar 8", day: "Sat", deposit: 22600,  pctOfGoal: 94.9, lateCount: 52,  lateDollar: 105200 },
  { date: "Mar 9", day: "Sun", deposit: 12800,  pctOfGoal: 95.7, lateCount: 48,  lateDollar: 97100  },
];

const incomeBudgetTotal = {
  date: "Week Total",
  day: "",
  deposit: incomeBudgetData.reduce((s, r) => s + r.deposit, 0),
  pctOfGoal: 95.7,
  lateCount: 48,
  lateDollar: 97100,
};

/* ── Daily Ops Section 2: Lead & Traffic Events ───────────────────────── */

const leadTrafficCols: SectionColumn[] = [
  { key: "date",       label: "Date",        align: "left" },
  { key: "phoneSms",   label: "Phone/SMS",   align: "right", format: "number" },
  { key: "internet",   label: "Internet",    align: "right", format: "number" },
  { key: "walkIn",     label: "Walk-In",     align: "right", format: "number" },
  { key: "totalLeads", label: "Total Leads", align: "right", format: "number" },
  { key: "tours",      label: "Tours",       align: "right", format: "number" },
];

const leadTrafficData = [
  { date: "Mar 3", phoneSms: 38, internet: 62, walkIn: 14, totalLeads: 114, tours: 42 },
  { date: "Mar 4", phoneSms: 41, internet: 58, walkIn: 16, totalLeads: 115, tours: 45 },
  { date: "Mar 5", phoneSms: 35, internet: 54, walkIn: 12, totalLeads: 101, tours: 38 },
  { date: "Mar 6", phoneSms: 42, internet: 65, walkIn: 18, totalLeads: 125, tours: 51 },
  { date: "Mar 7", phoneSms: 36, internet: 48, walkIn: 10, totalLeads: 94,  tours: 36 },
  { date: "Mar 8", phoneSms: 18, internet: 32, walkIn: 22, totalLeads: 72,  tours: 28 },
  { date: "Mar 9", phoneSms: 12, internet: 24, walkIn: 8,  totalLeads: 44,  tours: 16 },
];

const leadTrafficTotal = {
  date: "Week Total",
  phoneSms: leadTrafficData.reduce((s, r) => s + r.phoneSms, 0),
  internet: leadTrafficData.reduce((s, r) => s + r.internet, 0),
  walkIn: leadTrafficData.reduce((s, r) => s + r.walkIn, 0),
  totalLeads: leadTrafficData.reduce((s, r) => s + r.totalLeads, 0),
  tours: leadTrafficData.reduce((s, r) => s + r.tours, 0),
};

/* ── Daily Ops Section 3: Lease Activity ──────────────────────────────── */

const dailyLeaseCols: SectionColumn[] = [
  { key: "date",          label: "Date",           align: "left" },
  { key: "appsCompleted", label: "Apps Completed",  align: "right", format: "number" },
  { key: "appsDenied",    label: "Apps Denied",    align: "right", format: "number" },
  { key: "appsApproved",  label: "Apps Approved",  align: "right", format: "number" },
  { key: "leasesSigned",  label: "Leases Signed",  align: "right", format: "number" },
  { key: "moveIns",       label: "Move-Ins",       align: "right", format: "number" },
  { key: "moveOuts",      label: "Move-Outs",      align: "right", format: "number" },
];

const dailyLeaseData = [
  { date: "Mar 3", appsCompleted: 14, appsDenied: 2, appsApproved: 12, leasesSigned: 10, moveIns: 8,  moveOuts: 5 },
  { date: "Mar 4", appsCompleted: 16, appsDenied: 1, appsApproved: 15, leasesSigned: 12, moveIns: 9,  moveOuts: 4 },
  { date: "Mar 5", appsCompleted: 11, appsDenied: 2, appsApproved: 9,  leasesSigned: 8,  moveIns: 6,  moveOuts: 7 },
  { date: "Mar 6", appsCompleted: 18, appsDenied: 3, appsApproved: 15, leasesSigned: 14, moveIns: 11, moveOuts: 6 },
  { date: "Mar 7", appsCompleted: 12, appsDenied: 1, appsApproved: 11, leasesSigned: 9,  moveIns: 7,  moveOuts: 3 },
  { date: "Mar 8", appsCompleted: 6,  appsDenied: 1, appsApproved: 5,  leasesSigned: 4,  moveIns: 3,  moveOuts: 2 },
  { date: "Mar 9", appsCompleted: 3,  appsDenied: 0, appsApproved: 3,  leasesSigned: 2,  moveIns: 1,  moveOuts: 1 },
];

const dailyLeaseTotal = {
  date: "Week Total",
  appsCompleted: dailyLeaseData.reduce((s, r) => s + r.appsCompleted, 0),
  appsDenied: dailyLeaseData.reduce((s, r) => s + r.appsDenied, 0),
  appsApproved: dailyLeaseData.reduce((s, r) => s + r.appsApproved, 0),
  leasesSigned: dailyLeaseData.reduce((s, r) => s + r.leasesSigned, 0),
  moveIns: dailyLeaseData.reduce((s, r) => s + r.moveIns, 0),
  moveOuts: dailyLeaseData.reduce((s, r) => s + r.moveOuts, 0),
};

/* ── Daily Ops Section 4: Notices & Availability ──────────────────────── */

const noticesCols: SectionColumn[] = [
  { key: "date",           label: "Date",            align: "left" },
  { key: "ntvReceived",    label: "NTV Received",    align: "right", format: "number" },
  { key: "ntvRented",      label: "NTV Rented",      align: "right", format: "number" },
  { key: "vacantUnits",    label: "Vacant Units",    align: "right", format: "number" },
  { key: "availableUnits", label: "Available Units",  align: "right", format: "number" },
];

const noticesData = [
  { date: "Mar 3", ntvReceived: 6,  ntvRented: 3,  vacantUnits: 92, availableUnits: 124 },
  { date: "Mar 4", ntvReceived: 4,  ntvRented: 2,  vacantUnits: 88, availableUnits: 120 },
  { date: "Mar 5", ntvReceived: 5,  ntvRented: 4,  vacantUnits: 89, availableUnits: 119 },
  { date: "Mar 6", ntvReceived: 3,  ntvRented: 2,  vacantUnits: 84, availableUnits: 114 },
  { date: "Mar 7", ntvReceived: 7,  ntvRented: 3,  vacantUnits: 84, availableUnits: 117 },
  { date: "Mar 8", ntvReceived: 2,  ntvRented: 1,  vacantUnits: 83, availableUnits: 115 },
  { date: "Mar 9", ntvReceived: 1,  ntvRented: 1,  vacantUnits: 83, availableUnits: 114 },
];

const noticesTotal = {
  date: "Week Total",
  ntvReceived: noticesData.reduce((s, r) => s + r.ntvReceived, 0),
  ntvRented: noticesData.reduce((s, r) => s + r.ntvRented, 0),
  vacantUnits: 83,
  availableUnits: 114,
};

/* ── Assembled Daily Operations ───────────────────────────────────────── */

export const DAILY_OPS_MOCK_DATA: ReportSection[] = [
  {
    id: "income-budget",
    title: "Income Budget",
    subtitle: "Week of Mar 3–9, 2026",
    columns: incomeBudgetCols,
    data: incomeBudgetData,
    totalRow: incomeBudgetTotal,
    layout: "full",
  },
  {
    id: "lead-traffic",
    title: "Lead & Traffic Events",
    subtitle: "All sources",
    columns: leadTrafficCols,
    data: leadTrafficData,
    totalRow: leadTrafficTotal,
    layout: "full",
  },
  {
    id: "daily-lease-activity",
    title: "Lease Activity",
    subtitle: "Portfolio-wide",
    columns: dailyLeaseCols,
    data: dailyLeaseData,
    totalRow: dailyLeaseTotal,
    layout: "full",
  },
  {
    id: "notices-availability",
    title: "Notices & Availability",
    subtitle: "Running snapshot",
    columns: noticesCols,
    data: noticesData,
    totalRow: noticesTotal,
    layout: "full",
  },
];
