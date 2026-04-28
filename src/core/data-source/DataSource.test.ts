import { afterEach, describe, expect, it, vi } from "vitest";

import { DataSource } from "@/core/data-source/DataSource";
import { __resetDataSourceRegistryForTests } from "@/core/data-source/registry";
import type { PageFetchResult } from "@/core/data-source/types";

function makeRows(offset: number, limit: number, total: number): PageFetchResult {
  const rows = Array.from({ length: Math.min(limit, total - offset) }, (_, i) => ({
    n: offset + i,
  }));
  return { rows, total, offset, limit };
}

afterEach(() => {
  __resetDataSourceRegistryForTests();
});

describe("DataSource", () => {
  it("dedupes concurrent fetches for the same page", async () => {
    const fetchPage = vi.fn(async (offset: number, limit: number) =>
      makeRows(offset, limit, 1000),
    );
    const onChange = vi.fn();
    const ds = new DataSource("viz-test", { pageSize: 10 }, { fetchPage, onChange });

    ds.getRow(0);
    ds.getRow(5);
    await ds.ensurePage(0);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(0, 10, expect.any(AbortSignal));
    expect(ds.getRow(3)).toEqual({ state: "loaded", row: { n: 3 } });
  });

  it("keeps resident pages at or below bandPages after sequential loads", async () => {
    const fetchPage = vi.fn(async (offset: number, limit: number) =>
      makeRows(offset, limit, 10_000),
    );
    const ds = new DataSource(
      "viz-band",
      { pageSize: 10, bandPages: 3, overscanPages: 0 },
      { fetchPage, onChange: () => {} },
    );

    for (let p = 0; p <= 8; p++) {
      await ds.ensurePage(p);
      const resident = (ds as unknown as { pages: Map<number, unknown> }).pages
        .size;
      expect(resident).toBeLessThanOrEqual(3);
    }
  });

  it("refetches an evicted page on next getRow", async () => {
    const fetchPage = vi.fn(async (offset: number, limit: number) =>
      makeRows(offset, limit, 500),
    );
    const ds = new DataSource(
      "viz-evict",
      { pageSize: 10, bandPages: 2, overscanPages: 0 },
      { fetchPage, onChange: () => {} },
    );

    await ds.ensurePage(0);
    expect(ds.getRow(0)).toEqual({ state: "loaded", row: { n: 0 } });
    const callsAfterFirst = fetchPage.mock.calls.length;

    // Push hot band away from page 0 until eviction drops page 0 (bandPages=2).
    await ds.ensurePage(5);
    await ds.ensurePage(6);
    await ds.ensurePage(7);
    expect((ds as unknown as { pages: Map<number, unknown> }).pages.has(0)).toBe(
      false,
    );

    expect(ds.getRow(0).state).toBe("pending");
    await ds.ensurePage(0);
    expect(fetchPage.mock.calls.length).toBeGreaterThan(callsAfterFirst);
    expect(ds.getRow(0)).toEqual({ state: "loaded", row: { n: 0 } });
  });

  it("reset clears cache and refetches page 0", async () => {
    const fetchPage = vi.fn(async (offset: number, limit: number) =>
      makeRows(offset, limit, 200),
    );
    const ds = new DataSource("viz-reset", { pageSize: 10 }, {
      fetchPage,
      onChange: () => {},
    });

    await ds.ensurePage(0);
    await ds.ensurePage(1);
    fetchPage.mockClear();

    ds.reset();
    expect((ds as unknown as { pages: Map<number, unknown> }).pages.size).toBe(0);
    await ds.ensurePage(0);

    expect(fetchPage).toHaveBeenCalledWith(0, 10, expect.any(AbortSignal));
    expect(ds.total).toBe(200);
    expect((ds as unknown as { pages: Map<number, unknown> }).pages.size).toBe(1);
  });

  it("returns pending for negative index", () => {
    const ds = new DataSource(
      "viz-negative",
      {},
      { fetchPage: vi.fn(), onChange: () => {} },
    );
    expect(ds.getRow(-1)).toEqual({ state: "pending" });
  });

  it("warns on non-abort fetch errors", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = new Error("rpc failed");
    const fetchPage = vi.fn(async () => {
      throw err;
    });
    const ds = new DataSource("viz-warn", { pageSize: 10 }, {
      fetchPage,
      onChange: () => {},
    });

    await ds.ensurePage(0);

    expect(warnSpy).toHaveBeenCalledWith("[DataSource]", "viz-warn", err);
    warnSpy.mockRestore();
  });
});
