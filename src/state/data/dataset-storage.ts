import { createJSONStorage } from "jotai/utils";
import { idbSave } from "@/core/storage/indexdb";
import type { DatasetMeta } from "./dataset";

/** IndexedDB backup for dataset metadata when localStorage fails or is empty. */
export const DATASETS_MANIFEST_IDB_KEY = "datasources-manifest";

const PREVIEW_MAX_ROWS = 5;
const PREVIEW_MAX_STRING = 256;

/**
 * Shrink preview payload so `JSON.stringify(datasources)` stays under localStorage
 * quotas (~5MB). Full data remains in IndexedDB under `dataset:${id}`.
 */
export function slimDatasetMetaForPersistence(meta: DatasetMeta): DatasetMeta {
  return {
    ...meta,
    preview: clampPreview(meta.preview),
  };
}

function clampPreview(p: unknown): unknown {
  if (!Array.isArray(p)) return p;
  return p.slice(0, PREVIEW_MAX_ROWS).map((row) => clampRow(row));
}

function clampRow(row: unknown): unknown {
  if (row === null || typeof row !== "object" || Array.isArray(row)) {
    return row;
  }
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
    if (typeof v === "string" && v.length > PREVIEW_MAX_STRING) {
      o[k] = `${v.slice(0, PREVIEW_MAX_STRING)}…`;
    } else {
      o[k] = v;
    }
  }
  return o;
}

/**
 * jotai `createJSONStorage` wrapper: slim previews, mirror manifest to IndexedDB,
 * and survive localStorage quota errors (IDB still holds the list).
 */
export function createPersistedDatasetsStorage() {
  const base = createJSONStorage<DatasetMeta[]>(() => localStorage);
  return {
    ...base,
    setItem: (key: string, value: DatasetMeta[]) => {
      const slimmed = value.map(slimDatasetMetaForPersistence);
      void idbSave(DATASETS_MANIFEST_IDB_KEY, slimmed);
      try {
        base.setItem(key, slimmed);
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          console.warn(
            "[datasources] localStorage quota exceeded; dataset list kept in IndexedDB only. Reduce preview size or clear old data.",
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

/** Merge local + IDB-backed manifests (union by id; prefer richer preview). */
export function mergeDatasetManifests(
  fromLocal: DatasetMeta[],
  fromIdb: DatasetMeta[],
): DatasetMeta[] {
  const map = new Map<string, DatasetMeta>();
  for (const x of fromLocal) {
    map.set(x.id, slimDatasetMetaForPersistence(x));
  }
  for (const y of fromIdb) {
    const slim = slimDatasetMetaForPersistence(y);
    const cur = map.get(y.id);
    if (!cur) {
      map.set(y.id, slim);
      continue;
    }
    const curN = Array.isArray(cur.preview) ? cur.preview.length : 0;
    const yN = Array.isArray(slim.preview) ? slim.preview.length : 0;
    map.set(y.id, yN > curN ? slim : cur);
  }
  return Array.from(map.values());
}

/**
 * If IndexedDB has `dataset:<id>` rows but localStorage/manifest never stored metadata
 * (e.g. quota), add minimal entries so the UI lists them. Does not read row payloads.
 */
export function mergePlaceholderMetasForIdbDatasetKeys(
  current: DatasetMeta[],
  idbDatasetKeys: string[],
  builtInSampleDatasetId: string,
): DatasetMeta[] {
  const map = new Map(current.map((d) => [d.id, d]));
  const prefix = "dataset:";
  for (const key of idbDatasetKeys) {
    if (!key.startsWith(prefix)) continue;
    const id = key.slice(prefix.length);
    if (id === builtInSampleDatasetId) continue;
    if (map.has(id)) continue;
    map.set(id, {
      id,
      name: `Stored dataset (${id.slice(0, 8)}…)`,
      type: "json",
      size: "—",
      records: undefined,
      uploadDate: new Date().toISOString(),
      preview: [],
      storageKey: key as DatasetMeta["storageKey"],
    });
  }
  return Array.from(map.values());
}
