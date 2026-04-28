import {
  idbBulkWriteRows,
  idbClearRowsAndMeta,
  idbCountTimeRange,
  idbDelete,
  idbDeleteAllLegacyDatasetPrefixedKeys,
  idbDeleteAllRowsForDataset,
  idbDeleteLegacyKeysByPrefix,
  idbDeleteMeta,
  idbGet,
  idbGetMeta,
  idbHasLegacyKeysWithPrefix,
  idbIterateTimeRangePayloads,
  idbListDatasetKeys,
  idbPutMeta,
  idbReadOrdinalSlice,
  idbSave,
  type DatasetMetaRecord,
} from "@/core/storage/indexdb";
import type {
  AggregateMethod,
  DataDeleteArgs,
  DataGetAggregatedArgs,
  DataGetAggregatedResult,
  DataGetMetaArgs,
  DataGetPageArgs,
  DataGetPreviewArgs,
  DataGetRangeArgs,
  DataSaveArgs,
  DataDatasetMeta,
} from "@/core/rpc/data-contract";
import type { RpcRequest } from "@/core/rpc/config/protocol";
import type { timeseriesdata } from "@/types/data.types";
import { streamingBucketAggregate, streamingLttb } from "@/engine/aggregations/streaming";

import { ok, err } from "@/engine/rpcResponse";

/** Must match {@link DATASETS_MANIFEST_IDB_KEY} in dataset-storage (avoid importing Jotai into worker). */
const DATASETS_MANIFEST_IDB_KEY = "datasources-manifest";

const META_VERSION = 1 as const;

function xMsFromRow(row: unknown): number | null {
  if (row === null || typeof row !== "object" || Array.isArray(row)) return null;
  const x = (row as Record<string, unknown>).x;
  if (x instanceof Date) return x.getTime();
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const t = Date.parse(x);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function toTimeseriesRow(row: unknown): timeseriesdata | null {
  if (row === null || typeof row !== "object" || Array.isArray(row)) return null;
  const o = row as Record<string, unknown>;
  const yRaw = o.y;
  const y = typeof yRaw === "number" ? yRaw : Number(yRaw);
  if (!Number.isFinite(y)) return null;
  const tx = xMsFromRow(row);
  if (tx === null) return null;
  return { x: new Date(tx).toISOString(), y };
}

function applyOrderAndLimit(
  out: timeseriesdata[],
  order: "asc" | "desc",
  limit: number | undefined,
): timeseriesdata[] {
  out.sort((a, b) => {
    const da = Date.parse(String(a.x));
    const db = Date.parse(String(b.x));
    return order === "asc" ? da - db : db - da;
  });
  if (limit !== undefined && out.length > limit) {
    return out.slice(0, limit);
  }
  return out;
}

const EMPTY_META: DatasetMetaRecord = {
  version: META_VERSION,
  rowCount: 0,
  xRange: null,
};

async function ensureDataset(datasetId: string): Promise<DatasetMetaRecord> {
  const existing = await idbGetMeta(datasetId);
  if (existing) return existing;

  const legacyKey = `dataset:${datasetId}`;
  const legacy = await idbGet<unknown>(legacyKey);
  if (legacy !== undefined) {
    const rows = Array.isArray(legacy) ? legacy : legacy != null ? [legacy] : [];
    const { xRange } = await idbBulkWriteRows(datasetId, rows);
    const meta: DatasetMetaRecord = {
      version: META_VERSION,
      rowCount: rows.length,
      xRange,
    };
    await idbPutMeta(datasetId, meta);
    await idbDelete(legacyKey);
    return meta;
  }

  /** WIP keys from older experiments: `dataset:<id>:meta`, `dataset:<id>:chunk:<n>` */
  const wipPrefix = `${legacyKey}:`;
  if (await idbHasLegacyKeysWithPrefix(wipPrefix)) {
    await idbDeleteLegacyKeysByPrefix(wipPrefix);
  }

  /** Do not persist empty meta on read — avoids poisoning ids before `Data.save` completes. */
  return { ...EMPTY_META };
}

async function* iterTsInRangeAsc(
  datasetId: string,
  fromMs: number,
  toMs: number,
  signal?: AbortSignal,
): AsyncGenerator<timeseriesdata, void, undefined> {
  for await (const payload of idbIterateTimeRangePayloads(
    datasetId,
    fromMs,
    toMs,
    "next",
    signal,
  )) {
    const p = toTimeseriesRow(payload);
    if (p) yield p;
  }
}

export async function getMeta(req: RpcRequest) {
  const datasetId = req.args?.[0] as DataGetMetaArgs;
  if (typeof datasetId !== "string" || !datasetId) {
    return err(req.id, "E_BAD_REQUEST", "getMeta: datasetId required");
  }
  try {
    const meta = await ensureDataset(datasetId);
    const out: DataDatasetMeta = {
      rowCount: meta.rowCount,
      xRange: meta.xRange,
    };
    return ok(req.id, out);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function getPreview(req: RpcRequest) {
  const arg = req.args?.[0] as DataGetPreviewArgs;
  if (!arg || typeof arg.datasetId !== "string") {
    return err(req.id, "E_BAD_REQUEST", "getPreview: { datasetId, limit } required");
  }
  const limit = Math.max(1, Math.min(arg.limit ?? 50, 10_000));
  const signal = req.signal;
  try {
    const meta = await ensureDataset(arg.datasetId);
    if (meta.rowCount === 0) {
      return ok(req.id, []);
    }
    const slice = await idbReadOrdinalSlice(
      arg.datasetId,
      0,
      Math.min(limit, meta.rowCount),
      signal,
    );
    return ok(req.id, slice);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function getRange(req: RpcRequest) {
  const arg = req.args?.[0] as DataGetRangeArgs;
  if (!arg || typeof arg.datasetId !== "string") {
    return err(req.id, "E_BAD_REQUEST", "getRange: args required");
  }
  const signal = req.signal;
  const order = arg.order ?? "asc";
  const limit = arg.limit;
  try {
    await ensureDataset(arg.datasetId);
    const dir: IDBCursorDirection = order === "desc" ? "prev" : "next";
    const collected: timeseriesdata[] = [];
    for await (const payload of idbIterateTimeRangePayloads(
      arg.datasetId,
      arg.fromMs,
      arg.toMs,
      dir,
      signal,
    )) {
      const p = toTimeseriesRow(payload);
      if (!p) continue;
      const t = Date.parse(String(p.x));
      if (t < arg.fromMs || t > arg.toMs) continue;
      collected.push(p);
      if (limit !== undefined && collected.length >= limit) break;
    }
    return ok(req.id, applyOrderAndLimit(collected, order, limit));
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function getPage(req: RpcRequest) {
  const arg = req.args?.[0] as DataGetPageArgs;
  if (!arg || typeof arg.datasetId !== "string") {
    return err(req.id, "E_BAD_REQUEST", "getPage: args required");
  }
  const offset = Math.max(0, arg.offset | 0);
  const limit = Math.max(1, Math.min(arg.limit | 0, 500));
  const signal = req.signal;
  try {
    const meta = await ensureDataset(arg.datasetId);
    if (offset >= meta.rowCount) {
      return ok(req.id, {
        rows: [],
        total: meta.rowCount,
        offset,
        limit,
      });
    }
    const slice = await idbReadOrdinalSlice(
      arg.datasetId,
      offset,
      limit,
      signal,
    );
    return ok(req.id, {
      rows: slice,
      total: meta.rowCount,
      offset,
      limit,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function getAggregated(req: RpcRequest) {
  const arg = req.args?.[0] as DataGetAggregatedArgs;
  if (!arg || typeof arg.datasetId !== "string") {
    return err(req.id, "E_BAD_REQUEST", "getAggregated: args required");
  }
  const buckets = Math.max(2, Math.min(arg.buckets | 0, 4096));
  const method: AggregateMethod = arg.method ?? "lttb";
  const signal = req.signal;
  try {
    await ensureDataset(arg.datasetId);
    const count = await idbCountTimeRange(
      arg.datasetId,
      arg.fromMs,
      arg.toMs,
      signal,
    );
    if (count === 0) {
      const result: DataGetAggregatedResult = { points: [] };
      return ok(req.id, result);
    }

    const makeIter = () =>
      iterTsInRangeAsc(arg.datasetId, arg.fromMs, arg.toMs, signal);

    let points: timeseriesdata[];
    if (method === "lttb") {
      points = await streamingLttb(makeIter(), count, buckets);
    } else {
      points = await streamingBucketAggregate(
        makeIter(),
        arg.fromMs,
        arg.toMs,
        buckets,
        method,
      );
    }

    const result: DataGetAggregatedResult = { points };
    return ok(req.id, result);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function save(req: RpcRequest) {
  const arg = req.args?.[0] as DataSaveArgs;
  if (!arg || typeof arg.datasetId !== "string") {
    return err(req.id, "E_BAD_REQUEST", "save: { datasetId, data } required");
  }
  try {
    const rows = Array.isArray(arg.data) ? (arg.data as unknown[]) : [];
    await idbDeleteAllRowsForDataset(arg.datasetId);
    await idbDeleteMeta(arg.datasetId);
    await idbDelete(`dataset:${arg.datasetId}`);
    await idbDeleteLegacyKeysByPrefix(`dataset:${arg.datasetId}:`);

    const { xRange } = await idbBulkWriteRows(arg.datasetId, rows);
    const meta: DatasetMetaRecord = {
      version: META_VERSION,
      rowCount: rows.length,
      xRange,
    };
    await idbPutMeta(arg.datasetId, meta);

    return ok(req.id, true);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function deleteDataset(req: RpcRequest) {
  const id = req.args?.[0] as DataDeleteArgs;
  if (typeof id !== "string" || !id) {
    return err(req.id, "E_BAD_REQUEST", "deleteDataset: id required");
  }
  try {
    await idbDeleteAllRowsForDataset(id);
    await idbDeleteMeta(id);
    await idbDelete(`dataset:${id}`);
    await idbDeleteLegacyKeysByPrefix(`dataset:${id}:`);
    return ok(req.id, true);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function getManifest(req: RpcRequest) {
  try {
    const v = await idbGet<unknown>(DATASETS_MANIFEST_IDB_KEY);
    return ok(req.id, Array.isArray(v) ? v : []);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function saveManifest(req: RpcRequest) {
  const manifest = req.args?.[0];
  if (!Array.isArray(manifest)) {
    return err(req.id, "E_BAD_REQUEST", "saveManifest: array required");
  }
  try {
    await idbSave(DATASETS_MANIFEST_IDB_KEY, manifest);
    return ok(req.id, true);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function listDatasetKeys(req: RpcRequest) {
  try {
    const keys = await idbListDatasetKeys();
    return ok(req.id, keys);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function clearAll(req: RpcRequest) {
  try {
    await idbClearRowsAndMeta();
    await idbDeleteAllLegacyDatasetPrefixedKeys();
    await idbDelete(DATASETS_MANIFEST_IDB_KEY);
    return ok(req.id, true);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}
