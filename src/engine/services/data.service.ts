import {
  idbDelete,
  idbGet,
  idbListDatasetKeys,
  idbSave,
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
import { bucketAggregate, lttb } from "@/engine/aggregations";

import { ok, err } from "@/engine/rpcResponse";

/** Must match {@link DATASETS_MANIFEST_IDB_KEY} in dataset-storage (avoid importing Jotai into worker). */
const DATASETS_MANIFEST_IDB_KEY = "datasources-manifest";

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

async function loadRows(datasetId: string): Promise<unknown[]> {
  const raw = (await idbGet(`dataset:${datasetId}`)) ?? [];
  return Array.isArray(raw) ? raw : [raw];
}

function filterByRange(
  rows: unknown[],
  fromMs: number,
  toMs: number,
  order: "asc" | "desc",
  limit?: number,
): timeseriesdata[] {
  const out: timeseriesdata[] = [];
  for (const row of rows) {
    const p = toTimeseriesRow(row);
    if (!p) continue;
    const t = Date.parse(String(p.x));
    if (t < fromMs || t > toMs) continue;
    out.push(p);
  }
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

export async function getMeta(req: RpcRequest) {
  const datasetId = req.args?.[0] as DataGetMetaArgs;
  if (typeof datasetId !== "string" || !datasetId) {
    return err(req.id, "E_BAD_REQUEST", "getMeta: datasetId required");
  }
  try {
    const rows = await loadRows(datasetId);
    let minT = Infinity;
    let maxT = -Infinity;
    let any = false;
    for (const row of rows) {
      const t = xMsFromRow(row);
      if (t === null) continue;
      any = true;
      if (t < minT) minT = t;
      if (t > maxT) maxT = t;
    }
    const meta: DataDatasetMeta = {
      rowCount: rows.length,
      xRange: any ? [minT, maxT] : null,
    };
    return ok(req.id, meta);
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
  try {
    const rows = await loadRows(arg.datasetId);
    const slice = rows.slice(0, limit);
    return ok(req.id, slice);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}

export async function getRange(req: RpcRequest) {
  const arg = req.args?.[0] as DataGetRangeArgs;
  if (!arg || typeof arg.datasetId !== "string") {
    return err(req.id, "E_BAD_REQUEST", "getRange: args required");
  }
  try {
    const rows = await loadRows(arg.datasetId);
    const order = arg.order ?? "asc";
    const points = filterByRange(
      rows,
      arg.fromMs,
      arg.toMs,
      order,
      arg.limit,
    );
    return ok(req.id, points);
  } catch (e) {
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
  try {
    const rows = await loadRows(arg.datasetId);
    const slice = rows.slice(offset, offset + limit);
    return ok(req.id, {
      rows: slice,
      total: rows.length,
      offset,
      limit,
    });
  } catch (e) {
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
  try {
    const rows = await loadRows(arg.datasetId);
    let points = filterByRange(rows, arg.fromMs, arg.toMs, "asc");
    if (points.length > buckets) {
      if (method === "lttb") {
        points = lttb(points, buckets);
      } else {
        points = bucketAggregate(
          points,
          arg.fromMs,
          arg.toMs,
          buckets,
          method,
        );
      }
    }
    const result: DataGetAggregatedResult = { points };
    return ok(req.id, result);
  } catch (e) {
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
    await idbSave(`dataset:${arg.datasetId}`, arg.data);
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
    await idbDelete(`dataset:${id}`);
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
    const keys = await idbListDatasetKeys();
    await Promise.all(keys.map((k) => idbDelete(k)));
    await idbDelete(DATASETS_MANIFEST_IDB_KEY);
    return ok(req.id, true);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(req.id, "E_INTERNAL", message);
  }
}
