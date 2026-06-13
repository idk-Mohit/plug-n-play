import { createJSONStorage } from "jotai/utils";

import {
  isValidDashboardRecord,
  parseDashboardManifest,
} from "@/core/rpc/dashboard-record.guard";
import { getEngineRpc } from "@/core/rpc/engineSingleton";
import type { DashboardRecord } from "@/core/rpc/data-contract";

/** IndexedDB backup for dashboard list when localStorage fails or is empty. */
export const DASHBOARDS_MANIFEST_IDB_KEY = "dashboards-manifest";

/** Jotai storage adapter: localStorage primary, worker RPC backup on every set. */
export function createPersistedDashboardsStorage() {
  const base = createJSONStorage<DashboardRecord[]>(() => localStorage);
  return {
    ...base,
    setItem: (key: string, value: DashboardRecord[]) => {
      void getEngineRpc().call("Data", "saveDashboardManifest", [value]);
      try {
        base.setItem(key, value);
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          console.warn(
            "[dashboards] localStorage quota exceeded; list kept in IndexedDB only.",
            e,
          );
          try {
            localStorage.removeItem(key);
          } catch {
            /* ignore */
          }
          return;
        }
        throw e;
      }
    },
  };
}

/** Union merge by id; prefer the record with the newer `updatedAt`. */
export function mergePersistedDashboardsWithIndexedDb(
  local: DashboardRecord[],
  fromIdb: DashboardRecord[],
): DashboardRecord[] {
  const validLocal = local.filter(isValidDashboardRecord);
  const validIdb = fromIdb.filter(isValidDashboardRecord);
  if (validLocal.length === 0) return validIdb;
  if (validIdb.length === 0) return validLocal;

  const idbById = new Map(validIdb.map((d) => [d.id, d]));
  const seen = new Set<string>();
  const merged: DashboardRecord[] = [];

  for (const localRecord of validLocal) {
    const fromIndexedDb = idbById.get(localRecord.id);
    const pick =
      fromIndexedDb && fromIndexedDb.updatedAt > localRecord.updatedAt
        ? fromIndexedDb
        : localRecord;
    merged.push(pick);
    seen.add(localRecord.id);
  }

  for (const idbRecord of validIdb) {
    if (!seen.has(idbRecord.id)) merged.push(idbRecord);
  }

  return merged;
}

/** Loads and validates the worker-side manifest (used on app bootstrap). */
export async function fetchDashboardManifestFromIdb(): Promise<DashboardRecord[]> {
  const raw = await getEngineRpc().call<unknown>(
    "Data",
    "getDashboardManifest",
    [],
  );
  return parseDashboardManifest(raw);
}

export { isValidDashboardRecord, parseDashboardManifest };
