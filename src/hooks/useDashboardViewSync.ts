import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";

import {
  activeDashboardIdAtom,
  dashboardManifestHydratedAtom,
  findDashboardById,
  persistedDashboardsAtom,
  resolveActiveDashboard,
} from "@/state/data/dashboard";
import { shouldDeferDashboardUrlFallback } from "@/state/data/dashboard-view-sync.helpers";
import { activeViewAtom } from "@/state/ui/view";
import { dashboardViewState } from "@/state/ui/view-hash";

/**
 * Keeps `activeDashboardIdAtom` and `#dashboard?dashboardId=…` in sync.
 * Call once near the app shell (e.g. ViewRenderer).
 */
export function useDashboardViewSync() {
  const dashboards = useAtomValue(persistedDashboardsAtom);
  const hydrated = useAtomValue(dashboardManifestHydratedAtom);
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [activeId, setActiveId] = useAtom(activeDashboardIdAtom);

  useEffect(() => {
    if (activeView.view !== "dashboard") return;

    const hashDashboardId = activeView.meta?.dashboardId;
    if (typeof hashDashboardId === "string" && findDashboardById(dashboards, hashDashboardId)) {
      if (hashDashboardId !== activeId) setActiveId(hashDashboardId);
      return;
    }

    if (
      shouldDeferDashboardUrlFallback(hydrated, hashDashboardId, dashboards)
    ) {
      return;
    }

    const resolved = resolveActiveDashboard(dashboards, activeId);
    if (!resolved) return;
    if (activeView.meta?.dashboardId === resolved.id) return;
    setActiveView(dashboardViewState(resolved.id));
  }, [activeId, activeView, dashboards, hydrated, setActiveId, setActiveView]);
}
