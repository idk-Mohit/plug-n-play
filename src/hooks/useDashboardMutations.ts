import { useAtom, useSetAtom } from "jotai";

import { activeViewAtom } from "@/state/ui/view";
import { dashboardViewState } from "@/state/ui/view-hash";
import {
  activeDashboardIdAtom,
  appendDashboard,
  buildDashboardRecord,
  findDashboardById,
  persistedDashboardsAtom,
  resolveActiveDashboard,
  type CreateDashboardInput,
} from "@/state/data/dashboard";

/**
 * Dashboard list mutations for UI: create, switch active id, and navigate to the dashboard view.
 * Does not yet rename/delete or persist per-dashboard layout (Phase 1a/1b follow-ups).
 */
export function useDashboardMutations() {
  const [dashboards, setDashboards] = useAtom(persistedDashboardsAtom);
  const [activeId, setActiveId] = useAtom(activeDashboardIdAtom);
  const setView = useSetAtom(activeViewAtom);

  const activeDashboard = resolveActiveDashboard(dashboards, activeId);

  const createDashboard = (input: CreateDashboardInput) => {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return null;
    }

    const source = input.copiedFromId
      ? findDashboardById(dashboards, input.copiedFromId)
      : undefined;
    const record = buildDashboardRecord({ ...input, name: trimmedName }, source);
    setDashboards(appendDashboard(dashboards, record));
    setActiveId(record.id);
    setView(dashboardViewState(record.id));
    return record;
  };

  const switchDashboard = (id: string) => {
    if (!findDashboardById(dashboards, id)) return;
    setActiveId(id);
    setView(dashboardViewState(id));
  };

  return {
    dashboards,
    activeId,
    activeDashboard,
    createDashboard,
    switchDashboard,
  };
}
