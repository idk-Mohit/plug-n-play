import { useAtomValue, useSetAtom } from "jotai";
import { lazy, Suspense, useEffect } from "react";
import { activeViewAtom } from "@/state/ui/view";
import { HomeView } from "@/containers";
import { setBreadcrumbsAtom } from "@/state/ui/breadcrumbs";
import { ErrorBoundary } from "./ErrorBoundary";
import NotFound from "./404";
import { useViewSync } from "@/hooks/useViewAsync";
const VisualsView = lazy(() => import("@/containers/visualizations/Visuals"));
const DatasourceView = lazy(
  () => import("@/containers/datasources/Datasources")
);
const ActivityView = lazy(() => import("@/containers/activity/Activity"));
const ChangeLog = lazy(() => import("@/containers/updates/ChangelogPage"));
const DatasetsView = lazy(() => import("@/containers/dataset/Dataset"));

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
  useViewSync();
  const view = useAtomValue(activeViewAtom).view;
  const setBreadcrumbs = useSetAtom(setBreadcrumbsAtom);

  const Component = {
    dashboard: HomeView,
    datasources: DatasourceView,
    visuals: VisualsView,
    activity: ActivityView,
    changelogs: ChangeLog,
    dataset: DatasetsView,
  }[view];

  useEffect(() => {
    setBreadcrumbs(
      String(view).charAt(0).toUpperCase() + String(view).slice(1)
    );
  }, [view, setBreadcrumbs]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-4 text-muted">Loading view…</div>}>
        {Component ? <Component /> : <NotFound />}
      </Suspense>
    </ErrorBoundary>
  );
}
