"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/analytics/page-header";
import {
  MultiSectionRenderer,
  BOX_SCORE_MOCK_DATA,
  DAILY_OPS_MOCK_DATA,
  type ReportSection,
  type SectionColumn,
} from "@/components/analytics/multi-section-renderer";
import { SaveReportPanel } from "@/components/analytics/save-report-panel";
import { downloadCSV } from "@/lib/export-csv";
import { DataFreshness } from "@/components/analytics/data-freshness";
import { Download, Printer, Save } from "lucide-react";

interface DataPoint {
  metricSlug: string;
  metricName: string;
  metricFormat: string;
  propertyId: string;
  propertyName: string;
  period: string;
  value: number;
  previousValue: number | null;
  budgetValue: number | null;
}

interface PropertyInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  unitCount: number;
}

interface Props {
  template: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    templateType: string;
  };
  propertyData?: DataPoint[];
  properties?: PropertyInfo[];
  latestPeriod?: string;
}

function getLatestValueByProperty(
  data: DataPoint[],
  slug: string,
): Map<string, { value: number; budget: number | null }> {
  const result = new Map<string, { value: number; budget: number | null; period: string }>();
  for (const dp of data) {
    if (dp.metricSlug !== slug) continue;
    const existing = result.get(dp.propertyName);
    if (!existing || dp.period > existing.period) {
      result.set(dp.propertyName, { value: dp.value, budget: dp.budgetValue, period: dp.period });
    }
  }
  return new Map(
    Array.from(result.entries()).map(([k, v]) => [k, { value: v.value, budget: v.budget }]),
  );
}

function buildBoxScoreFromDb(
  data: DataPoint[],
  properties: PropertyInfo[],
): ReportSection[] {
  const occupancy = getLatestValueByProperty(data, "occupancy_rate");
  const leasing = getLatestValueByProperty(data, "leasing_velocity");
  const leads = getLatestValueByProperty(data, "lead_volume");
  const tours = getLatestValueByProperty(data, "tours_scheduled");
  const apps = getLatestValueByProperty(data, "applications_received");
  const signed = getLatestValueByProperty(data, "leases_signed");
  const moveIns = getLatestValueByProperty(data, "move_ins");
  const moveOuts = getLatestValueByProperty(data, "move_outs");
  const workOrders = getLatestValueByProperty(data, "work_orders_open");
  const renewals = getLatestValueByProperty(data, "renewal_rate");
  const gpr = getLatestValueByProperty(data, "gross_potential_rent");
  const egi = getLatestValueByProperty(data, "effective_gross_income");
  const ltl = getLatestValueByProperty(data, "loss_to_lease");

  const propNames = properties.map((p) => p.name);
  const propUnits = new Map(properties.map((p) => [p.name, p.unitCount]));
  const totalUnits = properties.reduce((s, p) => s + p.unitCount, 0);

  // Availability
  const availabilityCols: SectionColumn[] = [
    { key: "property", label: "Property", align: "left" },
    { key: "totalUnits", label: "Total Units", align: "right", format: "number" },
    { key: "occupied", label: "Occupied", align: "right", format: "number" },
    { key: "vacant", label: "Vacant", align: "right", format: "number" },
    { key: "occPct", label: "Occ%", align: "right", format: "percent" },
  ];
  const availabilityData = propNames.map((name) => {
    const units = propUnits.get(name) ?? 0;
    const occ = occupancy.get(name)?.value ?? 95;
    const occupied = Math.round(units * occ / 100);
    return {
      property: name,
      totalUnits: units,
      occupied,
      vacant: units - occupied,
      occPct: parseFloat(occ.toFixed(1)),
    };
  });
  const availTotal = {
    property: "Portfolio Total",
    totalUnits: totalUnits,
    occupied: availabilityData.reduce((s, r) => s + r.occupied, 0),
    vacant: availabilityData.reduce((s, r) => s + r.vacant, 0),
    occPct: parseFloat((availabilityData.reduce((s, r) => s + r.occPct * r.totalUnits, 0) / totalUnits).toFixed(1)),
  };

  // Pricing
  const pricingCols: SectionColumn[] = [
    { key: "property", label: "Property", align: "left" },
    { key: "avgMarketRent", label: "Avg Market Rent", align: "right", format: "currency" },
    { key: "avgEffRent", label: "Avg Effective Rent", align: "right", format: "currency" },
    { key: "ltlDollar", label: "Loss to Lease ($)", align: "right", format: "currency" },
    { key: "ltlPct", label: "LtL (%)", align: "right", format: "percent" },
  ];
  const pricingData = propNames.map((name) => {
    const units = propUnits.get(name) ?? 1;
    const gprVal = gpr.get(name)?.value ?? 0;
    const egiVal = egi.get(name)?.value ?? 0;
    const ltlVal = ltl.get(name)?.value ?? 0;
    const avgMarket = units > 0 ? Math.round(gprVal / units) : 0;
    const avgEff = units > 0 ? Math.round(egiVal / units) : 0;
    return {
      property: name,
      avgMarketRent: avgMarket,
      avgEffRent: avgEff,
      ltlDollar: Math.round(ltlVal),
      ltlPct: gprVal > 0 ? parseFloat(((ltlVal / gprVal) * 100).toFixed(1)) : 0,
    };
  });

  // Lead Activity
  const leadCols: SectionColumn[] = [
    { key: "property", label: "Property", align: "left" },
    { key: "newLeads", label: "New Leads", align: "right", format: "number" },
    { key: "tours", label: "Tours", align: "right", format: "number" },
    { key: "appsCompleted", label: "Apps Completed", align: "right", format: "number" },
  ];
  const leadData = propNames.map((name) => ({
    property: name,
    newLeads: Math.round(leads.get(name)?.value ?? (leasing.get(name)?.value ?? 10) * 5),
    tours: Math.round(tours.get(name)?.value ?? (leasing.get(name)?.value ?? 10) * 2.5),
    appsCompleted: Math.round(apps.get(name)?.value ?? (leasing.get(name)?.value ?? 10) * 1.2),
  }));
  const leadTotal = {
    property: "Total",
    newLeads: leadData.reduce((s, r) => s + r.newLeads, 0),
    tours: leadData.reduce((s, r) => s + r.tours, 0),
    appsCompleted: leadData.reduce((s, r) => s + r.appsCompleted, 0),
  };

  // Lease Activity
  const leaseCols: SectionColumn[] = [
    { key: "property", label: "Property", align: "left" },
    { key: "leasesSigned", label: "Leases Signed", align: "right", format: "number" },
    { key: "moveIns", label: "Move-Ins", align: "right", format: "number" },
    { key: "moveOuts", label: "Move-Outs", align: "right", format: "number" },
    { key: "net", label: "Net", align: "right", format: "number" },
  ];
  const leaseData = propNames.map((name) => {
    const mi = Math.round(moveIns.get(name)?.value ?? (leasing.get(name)?.value ?? 8));
    const mo = Math.round(moveOuts.get(name)?.value ?? mi * 0.8);
    const ls = Math.round(signed.get(name)?.value ?? (leasing.get(name)?.value ?? 10));
    return { property: name, leasesSigned: ls, moveIns: mi, moveOuts: mo, net: mi - mo };
  });
  const leaseTotal = {
    property: "Total",
    leasesSigned: leaseData.reduce((s, r) => s + r.leasesSigned, 0),
    moveIns: leaseData.reduce((s, r) => s + r.moveIns, 0),
    moveOuts: leaseData.reduce((s, r) => s + r.moveOuts, 0),
    net: leaseData.reduce((s, r) => s + r.net, 0),
  };

  // Make Ready
  const makeReadyCols: SectionColumn[] = [
    { key: "property", label: "Property", align: "left" },
    { key: "openWO", label: "Open WOs", align: "right", format: "number" },
    { key: "vacReady", label: "Vacant Ready", align: "right", format: "number" },
    { key: "vacNotReady", label: "Vacant Not Ready", align: "right", format: "number" },
  ];
  const makeReadyData = propNames.map((name) => {
    const wo = Math.round(workOrders.get(name)?.value ?? 10);
    const vacant = (propUnits.get(name) ?? 200) - Math.round((propUnits.get(name) ?? 200) * (occupancy.get(name)?.value ?? 95) / 100);
    const ready = Math.max(0, Math.round(vacant * 0.6));
    return { property: name, openWO: wo, vacReady: ready, vacNotReady: Math.max(0, vacant - ready) };
  });
  const makeReadyTotal = {
    property: "Total",
    openWO: makeReadyData.reduce((s, r) => s + r.openWO, 0),
    vacReady: makeReadyData.reduce((s, r) => s + r.vacReady, 0),
    vacNotReady: makeReadyData.reduce((s, r) => s + r.vacNotReady, 0),
  };

  // Exposure
  const exposureCols: SectionColumn[] = [
    { key: "property", label: "Property", align: "left" },
    { key: "exposureUnits", label: "Exposure Units", align: "right", format: "number" },
    { key: "exposurePct", label: "Exposure%", align: "right", format: "percent" },
  ];
  const exposureData = propNames.map((name) => {
    const units = propUnits.get(name) ?? 200;
    const occ = occupancy.get(name)?.value ?? 95;
    const vacantCount = Math.round(units * (100 - occ) / 100);
    const exposure = Math.round(vacantCount * 1.8);
    return { property: name, exposureUnits: exposure, exposurePct: parseFloat(((exposure / units) * 100).toFixed(1)) };
  });
  const exposureTotal = {
    property: "Total",
    exposureUnits: exposureData.reduce((s, r) => s + r.exposureUnits, 0),
    exposurePct: parseFloat(((exposureData.reduce((s, r) => s + r.exposureUnits, 0) / totalUnits) * 100).toFixed(1)),
  };

  return [
    { id: "availability", title: "Availability", subtitle: "Current month snapshot", columns: availabilityCols, data: availabilityData, totalRow: availTotal, layout: "full" },
    { id: "pricing", title: "Pricing", subtitle: "Effective rents & loss to lease", columns: pricingCols, data: pricingData, layout: "full" },
    { id: "lead-activity", title: "Lead Activity", subtitle: "Month to date", columns: leadCols, data: leadData, totalRow: leadTotal, layout: "half" },
    { id: "lease-activity", title: "Lease Activity", subtitle: "Month to date", columns: leaseCols, data: leaseData, totalRow: leaseTotal, layout: "half" },
    { id: "make-ready", title: "Make Ready Status", columns: makeReadyCols, data: makeReadyData, totalRow: makeReadyTotal, layout: "half" },
    { id: "exposure", title: "Exposure", subtitle: "60-day forward", columns: exposureCols, data: exposureData, totalRow: exposureTotal, layout: "half" },
  ];
}

export function MultiSectionReportViewer({ template, propertyData = [], properties = [], latestPeriod: latestPeriodProp }: Props) {
  const [showSave, setShowSave] = useState(false);
  const saveRef = useRef<HTMLDivElement>(null);

  const isBoxScore = template.slug.includes("box-score");
  const isDailyOps =
    template.slug.includes("daily-operations") ||
    template.slug.includes("daily-and-weekly");

  const hasDbData = propertyData.length > 0 && properties.length > 0;

  const dbSections = useMemo(() => {
    if (!hasDbData || !isBoxScore) return null;
    return buildBoxScoreFromDb(propertyData, properties);
  }, [propertyData, properties, hasDbData, isBoxScore]);

  const sections = dbSections ?? (isBoxScore
    ? BOX_SCORE_MOCK_DATA
    : isDailyOps
      ? DAILY_OPS_MOCK_DATA
      : BOX_SCORE_MOCK_DATA);

  const handleExport = useCallback(() => {
    const allRows: Record<string, any>[] = [];
    const colKeys: { key: string; label: string }[] = [{ key: "_section", label: "Section" }];
    const seenKeys = new Set<string>(["_section"]);

    for (const section of sections) {
      for (const col of section.columns) {
        if (!seenKeys.has(col.key)) {
          seenKeys.add(col.key);
          colKeys.push({ key: col.key, label: col.label });
        }
      }
      for (const row of section.data) {
        allRows.push({ _section: section.title, ...row });
      }
    }
    downloadCSV(allRows, colKeys, template.slug);
  }, [sections, template.slug]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.name}
        description={template.description}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
            <div ref={saveRef} className="relative">
              <button
                onClick={() => setShowSave(!showSave)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#7d654e] rounded-lg hover:bg-[#7d654e]/90 transition-colors"
              >
                <Save size={13} />
                Save Copy
              </button>
              {showSave && (
                <SaveReportPanel
                  templateId={template.id}
                  defaultName={template.name}
                  onClose={() => setShowSave(false)}
                />
              )}
            </div>
          </div>
        }
      />

      {latestPeriodProp && (
        <DataFreshness latestPeriod={latestPeriodProp} />
      )}

      <div className="flex items-center gap-3 text-xs text-[#7d654e]">
        <span className="px-2.5 py-1 bg-[#eddece] rounded-full font-medium">Multi-Section Report</span>
        <span>{sections.length} sections</span>
        <span>·</span>
        <span>{hasDbData && dbSections ? `${properties.length} properties (live data)` : "Last updated: Today"}</span>
      </div>

      <MultiSectionRenderer title={template.name} sections={sections} />
    </div>
  );
}
