import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { createPersistedDashboardsStorage } from "./dashboard-storage";
import { createDefaultMainDashboard } from "./dashboard.helpers";

export {
  DEFAULT_DASHBOARD_ID,
  appendDashboard,
  buildDashboardRecord,
  createDefaultMainDashboard,
  findDashboardById,
  nextDashboardName,
  resolveActiveDashboard,
  updateDashboardRecord,
  type CreateDashboardInput,
} from "./dashboard.helpers";

export { COPY_DASHBOARD_TEMPLATE, isCopyTemplate } from "./dashboard-templates";

/** All saved dashboards; mirrored to IndexedDB via the engine worker on write. */
export const persistedDashboardsAtom = atomWithStorage(
  "dashboards",
  [createDefaultMainDashboard()],
  createPersistedDashboardsStorage(),
  { getOnInit: true },
);

/** Id of the dashboard shown in the shell; persisted in localStorage. */
export const activeDashboardIdAtom = atomWithStorage<string | null>(
  "activeDashboardId",
  createDefaultMainDashboard().id,
);

/** Set true after App bootstrap merges the worker manifest (guards URL sync). */
export const dashboardManifestHydratedAtom = atom(false);
