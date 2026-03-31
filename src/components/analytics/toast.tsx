"use client";

import { useState, useCallback, useRef } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: typeof Info; iconClass: string; borderClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    borderClass: "border-l-emerald-500",
  },
  info: {
    icon: Info,
    iconClass: "text-[#7d654e]",
    borderClass: "border-l-[#7d654e]",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    borderClass: "border-l-amber-500",
  },
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function ToastContainer() {
    if (toasts.length === 0) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const config = VARIANT_CONFIG[t.variant];
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-center gap-3 bg-white border border-[#e8dfd4] border-l-4 rounded-xl shadow-lg px-4 py-3 min-w-[280px] max-w-sm animate-in slide-in-from-right-full duration-200",
                config.borderClass,
              )}
            >
              <Icon size={16} className={cn("shrink-0", config.iconClass)} />
              <span className="text-sm text-[#1a1510] flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-[#7d654e] hover:text-[#1a1510] shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return { toast, ToastContainer };
}
