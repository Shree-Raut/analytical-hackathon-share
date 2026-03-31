import { CheckCircle2, ChevronRight, Plus, Send } from "lucide-react";
import {
  DataTableComposer,
  type ColumnDef,
} from "@/components/analytics/data-table-composer";
import type { MappingEntry } from "./types";

interface StepPreviewProps {
  columns: ColumnDef[];
  data: Record<string, unknown>[];
  mappings: MappingEntry[];
  onColumnToggle: (key: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPreview({
  columns,
  data,
  mappings,
  onColumnToggle,
  onNext,
  onBack,
}: StepPreviewProps) {
  const activeMappings = mappings.filter((m) => !m.excluded);
  const matchedCount = activeMappings.filter((m) => m.matchedMetric).length;
  const confirmedCount = mappings.filter(
    (m) => !m.excluded && (m.status === "confirmed" || m.confidence >= 85),
  ).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="text-sm font-semibold text-[#1a1510]">
            Preview based on your uploaded data
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#7d654e]">
          <span className="bg-[#f7f3ef] px-2.5 py-1 rounded-md">{data.length} rows</span>
          <span className="bg-[#f7f3ef] px-2.5 py-1 rounded-md">
            {matchedCount} columns mapped
          </span>
          <span className="bg-[#f7f3ef] px-2.5 py-1 rounded-md">
            {confirmedCount} confirmed
          </span>
        </div>
      </div>

      <DataTableComposer
        columns={columns}
        data={data as Record<string, any>[]}
        onColumnToggle={onColumnToggle}
        showColumnPicker
        showGroupBy
        showChartToggle
      />

      <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#1a1510] mb-3">
          Enhance your report
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "Add trending occupancy (30/60/90)",
            "Add budget variance",
            "Add rent per square foot",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7d654e] bg-[#eddece] rounded-lg hover:bg-[#e3cebe] transition-colors"
            >
              <Plus size={12} />
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="What else would you like to add?"
            className="flex-1 px-3.5 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg outline-none focus:border-[#7d654e] text-[#1a1510] placeholder:text-[#7d654e]/40 transition-colors"
          />
          <button
            type="button"
            className="px-3 py-2 bg-[#7d654e] text-white rounded-lg hover:bg-[#6b5642] transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-[#7d654e] bg-white border border-[#e8dfd4] rounded-lg hover:bg-[#f7f3ef] transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7d654e] text-white text-sm font-medium rounded-lg hover:bg-[#6b5642] transition-colors"
        >
          Save &amp; Schedule
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
