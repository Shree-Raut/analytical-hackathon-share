import { cn } from "@/lib/utils";

interface ThresholdIndicatorProps {
  value: number;
  green?: number;
  yellow?: number;
  red?: number;
  format?: "currency" | "percent" | "number";
  className?: string;
}

function formatValue(value: number, format?: string) {
  switch (format) {
    case "currency":
      return `$${value.toLocaleString()}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
    default:
      return value.toLocaleString();
  }
}

function getColor(
  value: number,
  green?: number,
  yellow?: number,
): "green" | "yellow" | "red" {
  if (green != null && value >= green) return "green";
  if (yellow != null && value >= yellow) return "yellow";
  return "red";
}

const DOT_CLASSES = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400",
} as const;

export function ThresholdIndicator({
  value,
  green,
  yellow,
  format,
  className,
}: ThresholdIndicatorProps) {
  const color = getColor(value, green, yellow);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-2 w-2 rounded-full shrink-0", DOT_CLASSES[color])} />
      <span className="text-sm text-[#1a1510] tabular-nums">
        {formatValue(value, format)}
      </span>
    </span>
  );
}
