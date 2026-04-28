import { openDB, type IDBPDatabase } from "idb";

export const DB_NAME = "app-datasets";

/** Legacy manifest + monolithic `dataset:<id>` payloads. */
export const LEGACY_DATASET_STORE = "datasets";

/** Normalized per-row storage (keyPath: datasetId + ordinal i). */
export const ROWS_STORE = "rows";

/** Per-dataset metadata (`rowCount`, `xRange`). */
export const META_STORE = "dataset_meta";

const DB_VERSION = 2;

export type DatasetMetaRecord = {
  version: 1;
  rowCount: number;
  xRange: [number, number] | null;
};

/** Persisted row shape for {@link META_STORE} (inline keyPath `datasetId`). */
export type StoredDatasetMetaRecord = DatasetMetaRecord & { datasetId: string };

export type StoredRow = {
  datasetId: string;
  i: number;
  /** Epoch ms, or -1 when `x` is missing / non-time. */
  xMs: number;
  payload: unknown;
};

/** Keys persisted under `dataset:<uuid>` in the legacy object store. */
export function isDatasetObjectStoreKey(key: unknown): key is string {
  return typeof key === "string" && key.startsWith("dataset:");
}

function xMsFromPayload(row: unknown): number {
  if (row === null || typeof row !== "object" || Array.isArray(row)) return -1;
  const x = (row as Record<string, unknown>).x;
  if (x instanceof Date) return x.getTime();
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const t = Date.parse(x);
    return Number.isNaN(t) ? -1 : t;
  }
  return -1;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function __resetDbConnectionForTests(): void {
  dbPromise = null;
}

export async function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains(LEGACY_DATASET_STORE)) {
            db.createObjectStore(LEGACY_DATASET_STORE);
          }
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains(ROWS_STORE)) {
            const rowStore = db.createObjectStore(ROWS_STORE, {
              keyPath: ["datasetId", "i"],
            });
            rowStore.createIndex("byDatasetXMs", ["datasetId", "xMs"], {
              unique: false,
            });
          }
          if (!db.objectStoreNames.contains(META_STORE)) {
            db.createObjectStore(META_STORE, { keyPath: "datasetId" });
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function idbSave(key: string, data: unknown) {
  const db = await getDb();
  await db.put(LEGACY_DATASET_STORE, data, key);
}

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(LEGACY_DATASET_STORE, key);
}

export async function idbDelete(key: string) {
  const db = await getDb();
  await db.delete(LEGACY_DATASET_STORE, key);
}

/** Delete legacy-store keys whose string key starts with `prefix` (e.g. `dataset:<uuid>:`). */
export async function idbDeleteLegacyKeysByPrefix(prefix: string): Promise<void> {
  const db = await getDb();
  const keys = await db.getAllKeys(LEGACY_DATASET_STORE);
  const targets = keys.filter(
    (k): k is string => typeof k === "string" && k.startsWith(prefix),
  );
  if (targets.length === 0) return;
  const tx = db.transaction(LEGACY_DATASET_STORE, "readwrite");
  for (const k of targets) {
    tx.store.delete(k);
  }
  await tx.done;
}

/** True if any legacy-store key starts with `prefix`. */
export async function idbHasLegacyKeysWithPrefix(
  prefix: string,
): Promise<boolean> {
  const db = await getDb();
  const keys = await db.getAllKeys(LEGACY_DATASET_STORE);
  return keys.some((k) => typeof k === "string" && k.startsWith(prefix));
}

/** Remove every `dataset:*` key from the legacy store (monolithic, :meta, :chunk:n). */
export async function idbDeleteAllLegacyDatasetPrefixedKeys(): Promise<void> {
  await idbDeleteLegacyKeysByPrefix("dataset:");
}

export async function idbGetMeta(
  datasetId: string,
): Promise<DatasetMetaRecord | undefined> {
  const db = await getDb();
  const row = await db.get(META_STORE, datasetId);
  if (!row) return undefined;
  const rec = row as StoredDatasetMetaRecord;
  return {
    version: rec.version,
    rowCount: rec.rowCount,
    xRange: rec.xRange,
  };
}

export async function idbPutMeta(
  datasetId: string,
  meta: DatasetMetaRecord,
): Promise<void> {
  const db = await getDb();
  const rec: StoredDatasetMetaRecord = { datasetId, ...meta };
  await db.put(META_STORE, rec);
}

export async function idbDeleteMeta(datasetId: string): Promise<void> {
  const db = await getDb();
  await db.delete(META_STORE, datasetId);
}

/**
 * Write rows as individual records in batches (one tx per batch).
 * Returns combined xRange across all rows.
 */
export async function idbBulkWriteRows(
  datasetId: string,
  rows: unknown[],
  opts: { batchSize?: number; signal?: AbortSignal } = {},
): Promise<{ xRange: [number, number] | null }> {
  const batchSize = opts.batchSize ?? 5000;
  let minT = Infinity;
  let maxT = -Infinity;
  let anyX = false;

  for (let start = 0; start < rows.length; start += batchSize) {
    if (opts.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const end = Math.min(rows.length, start + batchSize);
    const db = await getDb();
    const tx = db.transaction(ROWS_STORE, "readwrite");
    for (let i = start; i < end; i++) {
      const payload = rows[i];
      const xMs = xMsFromPayload(payload);
      if (xMs !== -1) {
        anyX = true;
        if (xMs < minT) minT = xMs;
        if (xMs > maxT) maxT = xMs;
      }
      const rec: StoredRow = {
        datasetId,
        i,
        xMs: xMs === -1 ? -1 : xMs,
        payload,
      };
      tx.store.put(rec);
    }
    await tx.done;
  }

  return {
    xRange: anyX ? [minT, maxT] : null,
  };
}

/** Read up to `limit` payloads starting at ordinal `offset`. */
export async function idbReadOrdinalSlice(
  datasetId: string,
  offset: number,
  limit: number,
  signal?: AbortSignal,
): Promise<unknown[]> {
  if (limit <= 0) return [];
  const db = await getDb();
  const tx = db.transaction(ROWS_STORE, "readonly");
  const store = tx.store;
  const upper = Math.max(0, offset + limit - 1);
  const range = IDBKeyRange.bound([datasetId, offset], [datasetId, upper]);
  const out: unknown[] = [];
  let cur = await store.openCursor(range);
  while (cur) {
    if (signal?.aborted) {
      tx.abort();
      throw new DOMException("Aborted", "AbortError");
    }
    out.push((cur.value as StoredRow).payload);
    if (out.length >= limit) break;
    cur = await cur.continue();
  }
  await tx.done;
  return out;
}

/** Row count for `datasetId` using primary key range (ordinal `i` from 0). */
export async function idbRowCountForDataset(datasetId: string): Promise<number> {
  const db = await getDb();
  const tx = db.transaction(ROWS_STORE, "readonly");
  const range = IDBKeyRange.bound(
    [datasetId, 0],
    [datasetId, Number.MAX_SAFE_INTEGER],
  );
  const n = await tx.store.count(range);
  await tx.done;
  return n;
}

/**
 * Min/max `xMs` for rows in [datasetId] with `xMs >= 0` (via `byDatasetXMs`).
 * Omits rows stored with `xMs === -1`. Returns null when there is no time-keyed row.
 */
export async function idbTimeXRangeForDataset(
  datasetId: string,
): Promise<[number, number] | null> {
  const db = await getDb();
  const tx = db.transaction(ROWS_STORE, "readonly");
  const idx = tx.store.index("byDatasetXMs");
  const range = IDBKeyRange.bound(
    [datasetId, 0],
    [datasetId, Number.MAX_SAFE_INTEGER],
  );
  let cur = await idx.openCursor(range, "next");
  if (!cur) {
    await tx.done;
    return null;
  }
  let minT = (cur.key as [string, number])[1];
  let maxT = minT;
  while (cur) {
    const k = cur.key as [string, number];
    if (k[0] !== datasetId) break;
    const t = k[1];
    if (t < minT) minT = t;
    if (t > maxT) maxT = t;
    cur = await cur.continue();
  }
  await tx.done;
  return [minT, maxT];
}

/** Count rows whose (datasetId, xMs) falls in [fromMs, toMs] on the time index. */
export async function idbCountTimeRange(
  datasetId: string,
  fromMs: number,
  toMs: number,
  signal?: AbortSignal,
): Promise<number> {
  const db = await getDb();
  const tx = db.transaction(ROWS_STORE, "readonly");
  const idx = tx.store.index("byDatasetXMs");
  const range = IDBKeyRange.bound([datasetId, fromMs], [datasetId, toMs]);
  let n = 0;
  let cur = await idx.openCursor(range);
  while (cur) {
    if (signal?.aborted) {
      tx.abort();
      throw new DOMException("Aborted", "AbortError");
    }
    n++;
    cur = await cur.continue();
  }
  await tx.done;
  return n;
}

export async function* idbIterateTimeRangePayloads(
  datasetId: string,
  fromMs: number,
  toMs: number,
  direction: IDBCursorDirection,
  signal?: AbortSignal,
): AsyncGenerator<unknown, void, undefined> {
  const db = await getDb();
  const tx = db.transaction(ROWS_STORE, "readonly");
  const idx = tx.store.index("byDatasetXMs");
  const range = IDBKeyRange.bound([datasetId, fromMs], [datasetId, toMs]);
  let cur = await idx.openCursor(range, direction);
  let yielded = 0;
  const BATCH = 256;
  while (cur) {
    if (signal?.aborted) {
      tx.abort();
      throw new DOMException("Aborted", "AbortError");
    }
    yielded++;
    if (yielded % BATCH === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
    yield (cur.value as StoredRow).payload;
    cur = await cur.continue();
  }
  await tx.done;
}

export async function idbDeleteAllRowsForDataset(
  datasetId: string,
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(ROWS_STORE, "readwrite");
  const store = tx.store;
  const range = IDBKeyRange.bound(
    [datasetId, 0],
    [datasetId, Number.MAX_SAFE_INTEGER],
  );
  let cur = await store.openCursor(range);
  while (cur) {
    cur.delete();
    cur = await cur.continue();
  }
  await tx.done;
}

/** Legacy `dataset:*` keys in the old store (string keys only; no values loaded). */
export async function idbListLegacyDatasetKeyStrings(): Promise<string[]> {
  const db = await getDb();
  const keys = await db.getAllKeys(LEGACY_DATASET_STORE);
  return keys.filter(
    (k): k is string =>
      typeof k === "string" &&
      k.startsWith("dataset:") &&
      !k.endsWith(":meta") &&
      !/:chunk:\d+$/.test(k),
  );
}

/** Logical dataset ids as `dataset:<uuid>` from meta + legacy monolithic keys + row store. */
export async function idbListDatasetKeys(): Promise<string[]> {
  const db = await getDb();
  const tx = db.transaction(
    [META_STORE, LEGACY_DATASET_STORE, ROWS_STORE],
    "readonly",
  );
  const metaStore = tx.objectStore(META_STORE);
  const legStore = tx.objectStore(LEGACY_DATASET_STORE);
  const rowStore = tx.objectStore(ROWS_STORE);
  const metaIds = (await metaStore.getAllKeys()) as string[];
  const legacyKeys = (await legStore.getAllKeys()) as string[];
  const rowKeys = (await rowStore.getAllKeys()) as Array<[string, number]>;
  const rowDatasetIds = new Set<string>();
  for (const k of rowKeys) {
    if (Array.isArray(k) && typeof k[0] === "string") {
      rowDatasetIds.add(k[0]);
    }
  }
  await tx.done;

  const out = new Set<string>();
  for (const id of metaIds) {
    out.add(`dataset:${id}`);
  }
  for (const id of rowDatasetIds) {
    out.add(`dataset:${id}`);
  }
  for (const k of legacyKeys) {
    if (!k.startsWith("dataset:")) continue;
    const rest = k.slice("dataset:".length);
    if (!rest.includes(":")) {
      out.add(k);
    }
  }
  return [...out];
}

export async function idbClearRowsAndMeta(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([ROWS_STORE, META_STORE], "readwrite");
  tx.objectStore(ROWS_STORE).clear();
  tx.objectStore(META_STORE).clear();
  await tx.done;
}
