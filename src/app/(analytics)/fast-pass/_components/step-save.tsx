import { CheckCircle2, Clock, ExternalLink, Loader2, Mail, Save } from "lucide-react";
import { PUB_TIERS, type PublicationTier } from "./types";

interface StepSaveProps {
  reportName: string;
  setReportName: (v: string) => void;
  pubTier: PublicationTier;
  setPubTier: (v: PublicationTier) => void;
  scheduleEnabled: boolean;
  setScheduleEnabled: (v: boolean) => void;
  scheduleFreq: string;
  setScheduleFreq: (v: string) => void;
  scheduleDay: string;
  setScheduleDay: (v: string) => void;
  scheduleTime: string;
  setScheduleTime: (v: string) => void;
  scheduleRecipients: string;
  setScheduleRecipients: (v: string) => void;
  saved: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
  onBack: () => void;
  onGoToWorkspace: () => void;
}

export function StepSave({
  reportName,
  setReportName,
  pubTier,
  setPubTier,
  scheduleEnabled,
  setScheduleEnabled,
  scheduleFreq,
  setScheduleFreq,
  scheduleDay,
  setScheduleDay,
  scheduleTime,
  setScheduleTime,
  scheduleRecipients,
  setScheduleRecipients,
  saved,
  saving,
  saveError,
  onSave,
  onBack,
  onGoToWorkspace,
}: StepSaveProps) {
  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="absolute -inset-12 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  backgroundColor: [
                    "#7d654e",
                    "#10b981",
                    "#eddece",
                    "#f59e0b",
                    "#7d654e",
                    "#10b981",
                  ][i % 6],
                  top: `${20 + Math.sin((i * 30 * Math.PI) / 180) * 45}%`,
                  left: `${20 + Math.cos((i * 30 * Math.PI) / 180) * 45}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: "1.5s",
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#1a1510] mt-6">Report Saved!</h2>
        <p className="text-sm text-[#7d654e] mt-2 text-center max-w-md">
          &ldquo;{reportName}&rdquo; has been saved to your reports.
          {scheduleEnabled &&
            " It will be delivered every " + scheduleDay + " at " + scheduleTime + "."}
        </p>
        <button
          type="button"
          onClick={onGoToWorkspace}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#7d654e] text-white text-sm font-medium rounded-lg hover:bg-[#6b5642] transition-colors"
        >
          <ExternalLink size={14} />
          View in My Reports
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#1a1510] mb-1.5">
            Report Name
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg outline-none focus:border-[#7d654e] text-[#1a1510] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1a1510] mb-2">
            Publication Tier
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PUB_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPubTier(tier.id)}
                className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                  pubTier === tier.id
                    ? "bg-[#eddece] border-[#7d654e]"
                    : "bg-white border-[#e8dfd4] hover:bg-[#f7f3ef]"
                }`}
              >
                <span className="text-sm font-medium text-[#1a1510]">{tier.label}</span>
                <p className="text-[11px] text-[#7d654e] mt-0.5">{tier.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#7d654e]" />
            <span className="text-sm font-semibold text-[#1a1510]">
              Schedule Delivery
            </span>
          </div>
          <button
            type="button"
            onClick={() => setScheduleEnabled(!scheduleEnabled)}
            className={`w-10 h-5.5 rounded-full transition-colors relative ${
              scheduleEnabled ? "bg-[#7d654e]" : "bg-[#e8dfd4]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                scheduleEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {scheduleEnabled && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#7d654e] mb-1">
                  Frequency
                </label>
                <select
                  value={scheduleFreq}
                  onChange={(e) => setScheduleFreq(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg outline-none focus:border-[#7d654e] text-[#1a1510]"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7d654e] mb-1">Day</label>
                <select
                  value={scheduleDay}
                  onChange={(e) => setScheduleDay(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg outline-none focus:border-[#7d654e] text-[#1a1510]"
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7d654e] mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg outline-none focus:border-[#7d654e] text-[#1a1510]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7d654e] mb-1 flex items-center gap-1">
                <Mail size={12} />
                Recipients
              </label>
              <input
                type="text"
                value={scheduleRecipients}
                onChange={(e) => setScheduleRecipients(e.target.value)}
                placeholder="Enter email addresses, comma separated"
                className="w-full px-3 py-2 text-sm bg-[#faf7f4] border border-[#e8dfd4] rounded-lg outline-none focus:border-[#7d654e] text-[#1a1510] placeholder:text-[#7d654e]/40"
              />
            </div>
          </div>
        )}
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {saveError}
        </div>
      )}

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
          onClick={onSave}
          disabled={saving || !reportName.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7d654e] text-white text-sm font-semibold rounded-lg hover:bg-[#6b5642] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save Report"}
        </button>
      </div>
    </div>
  );
}
