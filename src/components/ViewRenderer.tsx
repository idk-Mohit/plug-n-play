import { useAtom } from "jotai";
import { Suspense } from "react";
import { activeViewAtom } from "@/atoms/view";
import {
  //   DashboardView,
  DatasetsView,
  VisualsView,
  ActivityView,
  HomeView,
} from "@/containers";

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

  const Component = {
    dashboard: HomeView,
    datasets: DatasetsView,
    visuals: VisualsView,
    activity: ActivityView,
  }[view];

  return (
    <Suspense fallback={<div className="p-4 text-muted">Loading view…</div>}>
      <Component />
    </Suspense>
  );
}
