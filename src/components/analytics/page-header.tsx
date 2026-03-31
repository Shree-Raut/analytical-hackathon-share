import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 pb-5 mb-6 border-b border-[#e8dfd4]",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-[#1a1510] tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[#7d654e] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
