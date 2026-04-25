import { createJSONStorage } from "jotai/utils";
import { getEngineRpc } from "@/core/rpc/engineSingleton";
import type { DatasetMeta } from "./dataset";
import {
  createDefaultSampleDatasetMeta,
  isDefaultSampleDatasetId,
} from "./defaultSampleDataset";

/** IndexedDB backup for dataset metadata when localStorage fails or is empty. */
export const DATASETS_MANIFEST_IDB_KEY = "datasources-manifest";

/** Preview rows kept in localStorage / manifest (clamped for quota). */
export const PREVIEW_MAX_ROWS = 10;
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
      void getEngineRpc().call("Data", "saveManifest", [slimmed]);
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

const DATASOURCES_LS_KEY = "datasources";

/** True when the persisted dataset list in localStorage is missing or empty. */
export function isPersistedDatasourcesListEmptyInLs(): boolean {
  try {
    const raw = localStorage.getItem(DATASOURCES_LS_KEY);
    if (raw === null || raw === "[]") return true;
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) && v.length === 0;
  } catch {
    return true;
  }
}

/**
 * User-recoverable content in IndexedDB: manifest backup and/or `dataset:*` blobs
 * (excluding the built-in sample id, which is not stored in IDB).
 */
export function hasIndexedDbRecoverableDatasets(
  fromIdbManifest: DatasetMeta[] | undefined,
  datasetKeys: string[],
  builtInSampleDatasetId: string,
): boolean {
  if ((fromIdbManifest?.length ?? 0) > 0) return true;
  const prefix = "dataset:";
  for (const key of datasetKeys) {
    if (!key.startsWith(prefix)) continue;
    const id = key.slice(prefix.length);
    if (id !== builtInSampleDatasetId) return true;
  }
  return false;
}

export function countRecoverableDatasetIds(
  fromIdbManifest: DatasetMeta[] | undefined,
  datasetKeys: string[],
  builtInSampleDatasetId: string,
): number {
  const ids = new Set<string>();
  for (const m of fromIdbManifest ?? []) {
    ids.add(m.id);
  }
  const prefix = "dataset:";
  for (const key of datasetKeys) {
    if (!key.startsWith(prefix)) continue;
    const id = key.slice(prefix.length);
    if (id !== builtInSampleDatasetId) ids.add(id);
  }
  return ids.size;
}

/** Same merge as app bootstrap: local + IDB manifest + placeholders + default sample row. */
export function mergePersistedDatasetsWithIndexedDbSources(
  prev: DatasetMeta[],
  fromIdbManifest: DatasetMeta[] | undefined,
  datasetKeys: string[],
  builtInSampleDatasetId: string,
): DatasetMeta[] {
  if (prev.length > 0 && (!fromIdbManifest || fromIdbManifest.length === 0)) {
    void getEngineRpc().call("Data", "saveManifest", [
      prev.map(slimDatasetMetaForPersistence),
    ]);
  }
  const mergedManifest = mergeDatasetManifests(prev, fromIdbManifest ?? []);
  const withIdbRows = mergePlaceholderMetasForIdbDatasetKeys(
    mergedManifest,
    datasetKeys,
    builtInSampleDatasetId,
  );
  if (withIdbRows.some((d) => d.id === builtInSampleDatasetId)) {
    return withIdbRows;
  }
  return [createDefaultSampleDatasetMeta(), ...withIdbRows];
}

export function needsPreviewHydration(meta: DatasetMeta): boolean {
  if (isDefaultSampleDatasetId(meta.id)) return false;
  if (!Array.isArray(meta.preview)) return true;
  return meta.preview.length === 0;
}

/**
 * Fill empty previews from IndexedDB `dataset:<id>` (first {@link PREVIEW_MAX_ROWS} rows).
 */
export async function hydrateMissingPreviewsFromIdb(
  metas: DatasetMeta[],
): Promise<DatasetMeta[]> {
  const out: DatasetMeta[] = [];
  for (const m of metas) {
    if (!needsPreviewHydration(m)) {
      out.push(m);
      continue;
    }
    const raw = await getEngineRpc().call<unknown[]>("Data", "getPreview", [
      { datasetId: m.id, limit: PREVIEW_MAX_ROWS },
    ]);
    out.push({ ...m, preview: clampPreview(raw) });
  }
  return out;
}

/** Remove all `dataset:*` entries and the datasources manifest from IndexedDB. */
export async function clearAllIndexedDbDatasetStorage(): Promise<void> {
  await getEngineRpc().call("Data", "clearAll", []);
}
