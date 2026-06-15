import type { DashboardTemplateId } from "@/core/rpc/data-contract";
import { cn } from "@/lib/utils";

type TemplatePreviewIllustrationProps = {
  variant: DashboardTemplateId;
  className?: string;
};

/** Lightweight CSS mockups — no external assets (local-first). */
export function TemplatePreviewIllustration({
  variant,
  className,
}: TemplatePreviewIllustrationProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border/50 bg-muted/30",
        className,
      )}
      aria-hidden
    >
      {variant === "blank" && <BlankPreview />}
      {variant === "chart-table" && <ChartTablePreview />}
      {variant === "analytics" && <AnalyticsPreview />}
      {variant === "copy" && <CopyPreview />}
    </div>
  );
}

function BlankPreview() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="h-full w-full rounded border border-dashed border-border/60 bg-background/40" />
    </div>
  );
}

function ChartTablePreview() {
  return (
    <div className="flex h-full flex-col gap-1.5 p-2.5">
      <div className="flex min-h-0 flex-1 flex-col rounded-sm border border-border/40 bg-background/50 p-2">
        <div className="mb-1.5 h-1 w-8 rounded-full bg-muted-foreground/30" />
        <div className="relative flex-1">
          <div className="absolute inset-x-0 bottom-2 h-px bg-border/60" />
          <svg
            viewBox="0 0 100 40"
            className="h-full w-full text-chart-1"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,32 20,28 40,18 60,22 80,8 100,14"
            />
          </svg>
        </div>
      </div>
      <div className="space-y-1 rounded-sm border border-border/40 bg-background/40 p-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-1">
            <div className="h-1 flex-1 rounded-full bg-muted-foreground/20" />
            <div className="h-1 w-6 rounded-full bg-muted-foreground/15" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="grid h-full grid-cols-3 gap-1.5 p-2.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-sm border border-border/40 bg-background/50 p-1.5"
        >
          <div className="mb-1 h-1 w-4 rounded-full bg-chart-2/70" />
          <div className="h-2 w-6 rounded-sm bg-muted-foreground/25" />
        </div>
      ))}
      <div className="col-span-3 min-h-0 flex-1 rounded-sm border border-border/40 bg-background/50 p-2">
        <div className="flex h-full items-end gap-1">
          {[40, 65, 35, 80, 50].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-chart-1/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CopyPreview() {
  return (
    <div className="relative flex h-full items-center justify-center p-4">
      <div className="absolute left-[18%] top-[22%] h-[55%] w-[42%] rotate-[-6deg] rounded border border-border/50 bg-background/30" />
      <div className="absolute right-[18%] top-[28%] h-[55%] w-[42%] rotate-[4deg] rounded border border-border/60 bg-background/60 shadow-sm" />
    </div>
  );
}
