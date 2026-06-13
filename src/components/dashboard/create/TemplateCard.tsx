import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TemplateCardProps = {
  label: string;
  description: string;
  preview: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
};

/**
 * GitBook-style selectable template tile: preview, title, description.
 */
export function TemplateCard({
  label,
  description,
  preview,
  selected = false,
  disabled = false,
  onSelect,
  className,
}: TemplateCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card text-left shadow-sm transition-colors",
        "hover:border-border hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        selected && "border-ring ring-1 ring-ring/40 bg-muted/15",
        disabled && "cursor-not-allowed opacity-50 hover:bg-card",
        className,
      )}
    >
      <div className="border-b border-border/40 bg-muted/10 p-2.5">{preview}</div>
      <div className="space-y-1 p-3">
        <p className="text-sm font-medium leading-tight text-foreground">
          {label}
        </p>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  );
}
