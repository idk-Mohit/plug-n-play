import { beforeEach, describe, expect, it, vi } from "vitest";

import { V, type RpcRequest } from "@/core/rpc/config/protocol";

type Meta = {
  version: 1;
  rowCount: number;
  xRange: [number, number] | null;
};

const store = vi.hoisted(() => ({
  meta: new Map<string, Meta>(),
  ordinal: new Map<string, Map<number, unknown>>(),
  legacy: new Map<string, unknown>(),
  idbPutMetaCalls: 0,
}));

vi.mock("@/core/storage/indexdb", () => ({
  idbGetMeta: async (id: string) => store.meta.get(id),
  idbPutMeta: async (id: string, m: Meta) => {
    store.idbPutMetaCalls++;
    store.meta.set(id, m);
  },
  idbDeleteMeta: async (id: string) => {
    store.meta.delete(id);
  },
  idbGet: async (key: string) => store.legacy.get(key),
  idbDelete: async (key: string) => {
    store.legacy.delete(key);
  },
  idbSave: vi.fn(),
  idbBulkWriteRows: async (datasetId: string, rows: unknown[]) => {
    let inner = store.ordinal.get(datasetId);
    if (!inner) {
      inner = new Map();
      store.ordinal.set(datasetId, inner);
    }
    inner.clear();
    rows.forEach((payload, i) => {
      inner!.set(i, payload);
    });
    return { xRange: null as [number, number] | null };
  },
  idbReadOrdinalSlice: async (
    datasetId: string,
    offset: number,
    limit: number,
  ) => {
    const inner = store.ordinal.get(datasetId);
    if (!inner) return [];
    const out: unknown[] = [];
    for (let i = 0; i < limit; i++) {
      const p = inner.get(offset + i);
      if (p !== undefined) out.push(p);
    }
    return out;
  },
  idbDeleteAllRowsForDataset: async (id: string) => {
    store.ordinal.delete(id);
  },
  idbDeleteLegacyKeysByPrefix: async (prefix: string) => {
    for (const k of [...store.legacy.keys()]) {
      if (k.startsWith(prefix)) store.legacy.delete(k);
    }
  },
  idbHasLegacyKeysWithPrefix: async (prefix: string) =>
    [...store.legacy.keys()].some((k) => k.startsWith(prefix)),
  idbDeleteAllLegacyDatasetPrefixedKeys: async () => {
    for (const k of [...store.legacy.keys()]) {
      if (k.startsWith("dataset:")) store.legacy.delete(k);
    }
  },
  idbClearRowsAndMeta: async () => {
    store.meta.clear();
    store.ordinal.clear();
  },
  idbCountTimeRange: vi.fn(async () => 0),
  idbIterateTimeRangePayloads: vi.fn(),
  idbListDatasetKeys: vi.fn(async () => []),
  idbRowCountForDataset: async (id: string) => {
    const inner = store.ordinal.get(id);
    return inner?.size ?? 0;
  },
  idbTimeXRangeForDataset: vi.fn(async () => null),
}));

import * as dataService from "./data.service";

beforeEach(() => {
  store.meta.clear();
  store.ordinal.clear();
  store.legacy.clear();
  store.idbPutMetaCalls = 0;
});

function makeReq(overrides: Partial<RpcRequest> = {}): RpcRequest {
  return {
    v: V,
    id: "r1",
    svc: "Data",
    method: "x",
    ...overrides,
  };
}

describe("data.service / ensureDataset & IO", () => {
  it("getPage for unknown dataset does not persist meta (no idbPutMeta)", async () => {
    const res = await dataService.getPage(
      makeReq({
        method: "getPage",
        args: [{ datasetId: "new-id", offset: 0, limit: 10 }],
      }),
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.result.rows).toEqual([]);
      expect(res.result.total).toBe(0);
    }
    expect(store.meta.has("new-id")).toBe(false);
    expect(store.idbPutMetaCalls).toBe(0);
  });

  it("save then getPage returns written rows", async () => {
    const rows = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const saveRes = await dataService.save(
      makeReq({
        method: "save",
        args: [{ datasetId: "ds1", data: rows }],
      }),
    );
    expect(saveRes.ok).toBe(true);

    const res = await dataService.getPage(
      makeReq({
        method: "getPage",
        args: [{ datasetId: "ds1", offset: 0, limit: 10 }],
      }),
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.result.total).toBe(3);
      expect(res.result.rows).toEqual(rows);
    }
  });

  it("save removes legacy WIP keys under dataset:<id>:", async () => {
    store.legacy.set("dataset:ds2:chunk:0", [1, 2, 3]);
    store.legacy.set("dataset:ds2:meta", { version: 1 });
    await dataService.save(
      makeReq({
        method: "save",
        args: [{ datasetId: "ds2", data: [{ x: 1 }] }],
      }),
    );
    expect(store.legacy.has("dataset:ds2:chunk:0")).toBe(false);
    expect(store.legacy.has("dataset:ds2:meta")).toBe(false);
  });

  it("getPage migrates legacy monolithic dataset:<id> array", async () => {
    store.legacy.set("dataset:ds4", [{ k: 1 }, { k: 2 }]);
    const res = await dataService.getPage(
      makeReq({
        method: "getPage",
        args: [{ datasetId: "ds4", offset: 0, limit: 10 }],
      }),
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.result.total).toBe(2);
      expect(res.result.rows).toEqual([{ k: 1 }, { k: 2 }]);
    }
    expect(store.legacy.has("dataset:ds4")).toBe(false);
    expect(store.meta.get("ds4")?.rowCount).toBe(2);
  });

  it("getPage drops WIP chunk keys and returns empty until save", async () => {
    store.legacy.set("dataset:ds5:chunk:0", [{ a: 1 }]);
    const res = await dataService.getPage(
      makeReq({
        method: "getPage",
        args: [{ datasetId: "ds5", offset: 0, limit: 10 }],
      }),
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.result.total).toBe(0);
      expect(res.result.rows).toEqual([]);
    }
    expect(store.legacy.has("dataset:ds5:chunk:0")).toBe(false);
    expect(store.meta.has("ds5")).toBe(false);
    expect(store.idbPutMetaCalls).toBe(0);
  });

  it("getPage rebuilds meta when ordinal rows exist but meta is missing", async () => {
    const rows = [{ v: 1 }, { v: 2 }];
    const inner = new Map<number, unknown>();
    inner.set(0, rows[0]);
    inner.set(1, rows[1]);
    store.ordinal.set("orphan", inner);

    const res = await dataService.getPage(
      makeReq({
        method: "getPage",
        args: [{ datasetId: "orphan", offset: 0, limit: 10 }],
      }),
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.result.total).toBe(2);
      expect(res.result.rows).toEqual(rows);
    }
    expect(store.meta.get("orphan")?.rowCount).toBe(2);
    expect(store.idbPutMetaCalls).toBeGreaterThan(0);
  });

  it("save persists a single JSON object as one row", async () => {
    const payload = { point: true, n: 42 };
    const saveRes = await dataService.save(
      makeReq({
        method: "save",
        args: [{ datasetId: "obj1", data: payload }],
      }),
    );
    expect(saveRes.ok).toBe(true);
    expect(store.meta.get("obj1")?.rowCount).toBe(1);

    const res = await dataService.getPage(
      makeReq({
        method: "getPage",
        args: [{ datasetId: "obj1", offset: 0, limit: 10 }],
      }),
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.result.total).toBe(1);
      expect(res.result.rows).toEqual([payload]);
    }
  });

  it("clearAll wipes rows, meta, legacy dataset:* keys, and manifest", async () => {
    store.meta.set("m1", {
      version: 1,
      rowCount: 1,
      xRange: null,
    });
    const inner = new Map<number, unknown>();
    inner.set(0, { x: 1 });
    store.ordinal.set("m1", inner);
    store.legacy.set("dataset:foo:chunk:0", [1]);
    store.legacy.set("dataset:bar", [2]);
    store.legacy.set("datasources-manifest", [{ id: "x" }]);

    const res = await dataService.clearAll(makeReq({ method: "clearAll" }));

    expect(res.ok).toBe(true);
    expect(store.meta.size).toBe(0);
    expect(store.ordinal.size).toBe(0);
    expect(store.legacy.size).toBe(0);
  });
});
