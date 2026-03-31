"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, Sparkles, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  metricName: string;
  currentValue: string | number;
}

type Stage = "form" | "sending" | "success";

export function EliOutreachModal({
  isOpen,
  onClose,
  propertyName,
  metricName,
  currentValue,
}: Props) {
  const [stage, setStage] = useState<Stage>("form");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  if (!isOpen) return null;

  function handleInitiate() {
    setStage("sending");
    setTimeout(() => setStage("success"), 1500);
  }

  function handleClose() {
    setStage("form");
    setEmailEnabled(true);
    setSmsEnabled(true);
    onClose();
  }

  const residentCount = Math.floor(Math.random() * 12) + 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-[#e8dfd4] shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8dfd4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sparkles size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1a1510]">
                Initiate ELI+ Payments Outreach
              </h3>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                L4 Interactive AI
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#7d654e] hover:text-[#1a1510] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {stage === "success" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
              <h4 className="text-sm font-semibold text-[#1a1510] mb-1">
                Outreach Initiated
              </h4>
              <p className="text-xs text-[#7d654e]">
                Outreach initiated for {residentCount} residents at{" "}
                <span className="font-medium text-[#1a1510]">{propertyName}</span>
              </p>
              <p className="text-[11px] text-[#7d654e]/60 mt-2">
                ELI+ Payments AI will handle follow-ups automatically.
              </p>
            </div>
          ) : stage === "sending" ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 size={28} className="text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-[#7d654e]">Initiating outreach...</p>
            </div>
          ) : (
            <>
              {/* Property & Metric info */}
              <div className="rounded-lg bg-[#faf7f4] border border-[#e8dfd4] p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7d654e]">Property</span>
                  <span className="font-medium text-[#1a1510]">{propertyName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7d654e]">Metric</span>
                  <span className="font-medium text-[#1a1510]">{metricName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7d654e]">Current Value</span>
                  <span className="font-medium text-[#1a1510]">{currentValue}</span>
                </div>
              </div>

              {/* Action description */}
              <div className="text-xs text-[#1a1510]/80 leading-relaxed">
                <span className="font-medium">Action:</span> Send automated payment reminder
                to delinquent residents at{" "}
                <span className="font-medium">{propertyName}</span>
              </div>

              {/* Channel selector */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-2">
                  Channels
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="accent-[#7d654e]"
                    />
                    <Mail size={13} className="text-[#7d654e]" />
                    <span className="text-xs text-[#1a1510]">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                      className="accent-[#7d654e]"
                    />
                    <MessageSquare size={13} className="text-[#7d654e]" />
                    <span className="text-xs text-[#1a1510]">SMS</span>
                  </label>
                </div>
              </div>

              {/* Message preview */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-2">
                  Message Preview
                </label>
                <div className="rounded-lg border border-[#e8dfd4] bg-[#faf7f4] p-3 text-xs text-[#1a1510]/80 leading-relaxed italic">
                  &ldquo;Hi [resident], our records show an outstanding balance of [amount].
                  Please make a payment at your earliest convenience via the Entrata
                  Resident Portal.&rdquo;
                </div>
              </div>

              {/* AI badge */}
              <div className="text-[11px] text-[#7d654e]/60">
                This outreach will be handled by{" "}
                <span className="font-medium text-blue-600">ELI+ Payments AI</span>{" "}
                (L4)
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {stage === "form" && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e8dfd4]">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInitiate}
              disabled={!emailEnabled && !smsEnabled}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50",
              )}
            >
              <Sparkles size={13} />
              Initiate Outreach
            </button>
          </div>
        )}
        {stage === "success" && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-[#e8dfd4]">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium bg-[#7d654e] hover:bg-[#7d654e]/90 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
