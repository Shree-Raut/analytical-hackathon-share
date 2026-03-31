"use client";

import { useState, useRef, useEffect } from "react";
import { Save, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface SaveReportPanelProps {
  templateId: string;
  defaultName?: string;
  filters?: Record<string, unknown>;
  onClose: () => void;
  onSaved?: () => void;
}

export function SaveReportPanel({
  templateId,
  defaultName = "",
  filters = {},
  onClose,
  onSaved,
}: SaveReportPanelProps) {
  const [name, setName] = useState(defaultName ? `${defaultName} — Copy` : "");
  const [tier, setTier] = useState("PERSONAL");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, name: name.trim(), filters, tier }),
      });
      if (res.ok) {
        setSaved(true);
        onSaved?.();
        setTimeout(onClose, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save report");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#e8dfd4] rounded-xl shadow-xl z-30 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#1a1510]">
          Save Report Copy
        </span>
        <button
          onClick={onClose}
          className="text-[#7d654e] hover:text-[#1a1510]"
        >
          <X size={14} />
        </button>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 py-3 text-sm">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span className="text-emerald-700 font-medium">
            Saved to My Workspace
          </span>
          <Link
            href="/workspace"
            className="ml-2 text-xs text-[#7d654e] underline underline-offset-2 hover:text-[#1a1510]"
          >
            View
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#faf7f4] border border-[#e8dfd4] rounded-lg px-3 py-2 text-sm text-[#1a1510] focus:outline-none focus:border-[#7d654e]/50"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold block mb-1">
                Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-[#faf7f4] border border-[#e8dfd4] rounded-lg px-3 py-2 text-sm text-[#1a1510] focus:outline-none focus:border-[#7d654e]/50 appearance-none"
              >
                <option value="PERSONAL">Personal</option>
                <option value="TEAM">Team</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#7d654e] hover:text-[#1a1510] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#7d654e] hover:bg-[#7d654e]/90 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}
