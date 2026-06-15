import { LayoutDashboard } from "lucide-react";
import { useSetAtom } from "jotai";

import { Button } from "@/components/ui/button";
import { footerDrawerOpenAtom } from "@/state/ui/layout";

type EmptyDashboardSectionProps = {
  dashboardName?: string;
};

/** Empty state when a dashboard has no panels (blank template or user cleared layout). */
export function EmptyDashboardSection({
  dashboardName,
}: EmptyDashboardSectionProps) {
  const setDrawerOpen = useSetAtom(footerDrawerOpenAtom);

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
            has no charts or tables yet. Add visualizations and pick a dataset
            from dashboard settings.
          </>
        ) : (
          <>
            No charts or tables yet. Add visualizations and pick a dataset from
            dashboard settings.
          </>
        )}
      </p>
      <Button
        type="button"
        size="sm"
        className="mt-4 h-8 text-xs"
        onClick={() => setDrawerOpen(true)}
      >
        Configure dashboard
      </Button>
    </section>
  );
}
