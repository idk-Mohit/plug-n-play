import { useAtom, useSetAtom } from "jotai";
import { Suspense, useEffect } from "react";
import { activeViewAtom } from "@/atoms/view";
import {
  //   DashboardView,
  DatasetsView,
  VisualsView,
  ActivityView,
  HomeView,
} from "@/containers";
import { setBreadcrumbsAtom } from "@/atoms/breadcrumbs";

/**
 * A component that renders the current view based on the activeViewAtom.
 *
 * The current view is determined by the value of the activeViewAtom.
 * The component then renders the corresponding view component.
 *
 * The component uses the <Suspense> API to handle loading states.
 * When the component is rendering, it will show a fallback message
 * until the view component is fully loaded.
 */
export default function ViewRenderer() {
  const [view] = useAtom(activeViewAtom);

  const setBreadcrumbs = useSetAtom(setBreadcrumbsAtom);

  const Component = {
    dashboard: HomeView,
    datasets: DatasetsView,
    visuals: VisualsView,
    activity: ActivityView,
  }[view];

  useEffect(() => {
    setBreadcrumbs(
      String(view).charAt(0).toUpperCase() + String(view).slice(1)
    );
  }, [view, setBreadcrumbs]);

  return (
    <Suspense fallback={<div className="p-4 text-muted">Loading view…</div>}>
      <Component />
    </Suspense>
  );
}
