import type { DashboardRecord } from "@/core/rpc/data-contract";

import { findDashboardById } from "./dashboard.helpers";

/**
 * When false, URL sync must not fall back to a default dashboard — the hash id
 * may exist only in IndexedDB until bootstrap finishes.
 */
export function shouldDeferDashboardUrlFallback(
  hydrated: boolean,
  hashDashboardId: string | undefined,
  dashboards: DashboardRecord[],
): boolean {
  if (hydrated) return false;
  if (typeof hashDashboardId !== "string" || hashDashboardId.length === 0) {
    return false;
  }
  return !findDashboardById(dashboards, hashDashboardId);
}
