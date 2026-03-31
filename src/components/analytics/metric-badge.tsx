import { cn } from "@/lib/utils";
import { Shield, User } from "lucide-react";

interface MetricBadgeProps {
  tier: string;
  className?: string;
}

const TIER_CONFIG: Record<string, { label: string; icon: typeof Shield; classes: string }> = {
  CANONICAL: {
    label: "Canonical",
    icon: Shield,
    classes: "text-blue-700 bg-blue-50 border-blue-200",
  },
  CUSTOMER: {
    label: "Customer",
    icon: User,
    classes: "text-amber-700 bg-amber-50 border-amber-200",
  },
};

export function MetricBadge({ tier, className }: MetricBadgeProps) {
  const config = TIER_CONFIG[tier.toUpperCase()];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        config.classes,
        className
      )}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}
