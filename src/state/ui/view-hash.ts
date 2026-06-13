import type { ViewState } from "@/state/ui/view";
import { isViewName } from "@/state/ui/view-names";

/** Hash-safe dashboard route payload (`#dashboard?dashboardId=…`). */
export function dashboardViewState(dashboardId: string): ViewState {
  return { view: "dashboard", meta: { dashboardId } };
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
