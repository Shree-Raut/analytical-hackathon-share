import { Check } from "lucide-react";
import { STEPS } from "./types";

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((s, i) => {
        const completed = currentStep > s.id;
        const active = currentStep === s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  completed
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-[#7d654e] text-white"
                      : "bg-[#e8dfd4] text-[#7d654e]"
                }`}
              >
                {completed ? <Check size={16} /> : s.id}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium ${
                  active ? "text-[#1a1510]" : "text-[#7d654e]"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 mb-5 transition-colors ${
                  currentStep > s.id ? "bg-emerald-500" : "bg-[#e8dfd4]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
