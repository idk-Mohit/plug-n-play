import { LayoutDashboard } from "lucide-react";

type EmptyDashboardSectionProps = {
  dashboardName?: string;
};

/** Empty state for dashboards created with the blank template (Phase 1a). */
export function EmptyDashboardSection({
  dashboardName,
}: EmptyDashboardSectionProps) {
  return (
    <section
      className="flex min-h-[min(60vh,28rem)] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/15 p-8 text-center shadow-sm animate-in fade-in ease-linear"
      aria-label={
        dashboardName
          ? `Empty dashboard: ${dashboardName}`
          : "Empty dashboard"
      }
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted/60">
        <LayoutDashboard
          className="h-6 w-6 text-muted-foreground"
          aria-hidden
        />
      </div>
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        This dashboard is empty
      </h2>
      <p className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
        {dashboardName ? (
          <>
            <span className="font-medium text-foreground">{dashboardName}</span>{" "}
            has no charts or tables yet. Layout and widgets arrive in a later
            phase — for now you have a clean slate.
          </>
        ) : (
          <>
            No charts or tables yet. Layout and widgets arrive in a later phase
            — for now you have a clean slate.
          </>
        )}
      </p>
    </section>
  );
}
