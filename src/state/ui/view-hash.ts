import type { ViewState } from "@/state/ui/view";
import { isViewName } from "@/state/ui/view-names";

const ACTIVE_VIEW_STORAGE_KEY = "activeView:v2";

/** Hash-safe dashboard route payload (`#dashboard?dashboardId=…`). */
export function dashboardViewState(dashboardId: string): ViewState {
  return { view: "dashboard", meta: { dashboardId } };
}

/** Hash-safe dataset route payload (`#dataset?datasetId=…&tab=…`). */
export function datasetViewState(
  datasetId: string,
  tab = "preview",
): ViewState {
  return { view: "dataset", meta: { datasetId, tab } };
}

export function parseViewFromHash(hash: string): ViewState | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  const [view, query = ""] = raw.split("?");
  if (!view || !isViewName(view)) return null;
  const meta = Object.fromEntries(new URLSearchParams(query));
  return {
    view,
    meta: Object.keys(meta).length > 0 ? meta : undefined,
  };
}

function readViewFromLocalStorage(key: string): ViewState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ViewState;
    if (parsed?.view && isViewName(parsed.view)) return parsed;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

/** URL hash wins over localStorage; used for boot-time view resolution. */
export function resolveViewFromLocation(): ViewState {
  if (typeof window === "undefined") {
    return { view: "dashboard", meta: undefined };
  }
  const fromHash = parseViewFromHash(window.location.hash);
  if (fromHash) return fromHash;
  const fromStorage = readViewFromLocalStorage(ACTIVE_VIEW_STORAGE_KEY);
  if (fromStorage) return fromStorage;
  return { view: "dashboard", meta: undefined };
}

export { ACTIVE_VIEW_STORAGE_KEY };
