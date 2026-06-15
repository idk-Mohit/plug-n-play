import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type QuickActionCardProps = {
  label: string;
  icon: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
};

/** Compact action tile for secondary create flows (e.g. copy existing). */
export function QuickActionCard({
  label,
  icon,
  selected = false,
  disabled = false,
  onSelect,
  className,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-4 text-center shadow-sm transition-colors",
        "hover:border-border hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-ring ring-1 ring-ring/40 bg-muted/15",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-muted/40 text-muted-foreground">
        {icon}
      </span>
      <span className="text-xs font-medium leading-tight text-foreground">
        {label}
      </span>
    </button>
  );
}
