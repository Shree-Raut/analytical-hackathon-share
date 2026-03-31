import { cn } from "@/lib/utils";
import { Users, Globe, BadgeCheck } from "lucide-react";

interface PublicationTierBadgeProps {
  tier: string;
  className?: string;
}

const TIER_CONFIG: Record<
  string,
  { label: string; icon: typeof Globe; classes: string } | null
> = {
  PERSONAL: null,
  TEAM: {
    label: "Team",
    icon: Users,
    classes: "text-slate-700 bg-slate-100 border-slate-200",
  },
  PUBLISHED: {
    label: "Published",
    icon: Globe,
    classes: "text-blue-700 bg-blue-50 border-blue-200",
  },
  CERTIFIED: {
    label: "Certified",
    icon: BadgeCheck,
    classes: "text-amber-700 bg-amber-50 border-amber-200",
  },
};

export function PublicationTierBadge({ tier, className }: PublicationTierBadgeProps) {
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
