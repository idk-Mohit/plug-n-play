import type {
  DataSourceDeps,
  DataSourcePolicy,
  DataSourceStats,
  GetRowResult,
  PageFetchResult,
} from "@/core/data-source/types";
import {
  registerDataSource,
  unregisterDataSource,
} from "@/core/data-source/registry";

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_BAND_PAGES = 10;
const DEFAULT_OVERSCAN_PAGES = 1;
/** Cap concurrent in-flight `fetchPage` calls (scroll storm → worker RPC flood). */
const DEFAULT_MAX_INFLIGHT = 3;

export class DataSource<Row = unknown> {
  readonly pageSize: number;
  readonly bandPages: number;
  readonly overscanPages: number;
  readonly vizId: string;

  private readonly deps: DataSourceDeps;
  private disposed = false;

  /** Page index -> rows for that page (length <= pageSize on last page). */
  private readonly pages = new Map<number, unknown[]>();
  private readonly inFlight = new Map<number, Promise<void>>();
  /** Pages touched by getRow since last interest tracking; trimmed when pages evicted. */
  private readonly hotPages = new Set<number>();

  /** Pages waiting behind backpressure; drained LIFO (most recent wins when trimmed). */
  private readonly pendingQueue: number[] = [];
  private readonly pendingSet = new Set<number>();
  private readonly pendingResolvers = new Map<number, Array<() => void>>();
  private readonly maxInflight = DEFAULT_MAX_INFLIGHT;

  private readonly pageAbort = new Map<number, AbortController>();

  private _total = 0;

  constructor(
    vizId: string,
    policy: DataSourcePolicy | undefined,
    deps: DataSourceDeps,
  ) {
    this.vizId = vizId;
    this.pageSize = policy?.pageSize ?? DEFAULT_PAGE_SIZE;
    this.bandPages = policy?.bandPages ?? DEFAULT_BAND_PAGES;
    this.overscanPages = policy?.overscanPages ?? DEFAULT_OVERSCAN_PAGES;
    this.deps = deps;
    registerDataSource(this as unknown as DataSource<unknown>);
  }

  /** Activity / diagnostics: resident pages, hot interest, totals, in-flight fetches. */
  stats(): DataSourceStats {
    return {
      vizId: this.vizId,
      pages: this.pages.size,
      hot: this.hotPages.size,
      total: this._total,
      inflight: this.inFlight.size,
    };
  }

  get total(): number {
    return this._total;
  }

  private rowIndexToPage(i: number): number {
    return Math.floor(i / this.pageSize);
  }

  private pageStartIndex(p: number): number {
    return p * this.pageSize;
  }

  getRow(i: number): GetRowResult<Row> {
    if (i < 0) return { state: "pending" };
    if (this._total > 0 && i >= this._total) {
      return { state: "loaded", row: {} as Row };
    }

    const p = this.rowIndexToPage(i);
    this.hotPages.add(p);

    const pageRows = this.pages.get(p);
    if (pageRows) {
      const local = i - this.pageStartIndex(p);
      const row = pageRows[local];
      if (row === undefined) return { state: "pending" };
      return { state: "loaded", row: row as Row };
    }

    void this.ensurePage(p);
    return { state: "pending" };
  }

  ensurePage(p: number): Promise<void> {
    if (this.disposed) return Promise.resolve();
    if (this.pages.has(p)) return Promise.resolve();

    const existing = this.inFlight.get(p);
    if (existing) return existing;

    if (this.inFlight.size >= this.maxInflight) {
      return this.queuePending(p);
    }

    return this.dispatchFetch(p);
  }

  private queuePending(p: number): Promise<void> {
    if (!this.pendingSet.has(p)) {
      this.pendingQueue.push(p);
      this.pendingSet.add(p);
      const maxQueued = this.maxInflight * 4;
      while (this.pendingQueue.length > maxQueued) {
        const old = this.pendingQueue.shift();
        if (old !== undefined) {
          this.pendingSet.delete(old);
          this.resolvePending(old);
        }
      }
    }

    return new Promise<void>((resolve) => {
      const list = this.pendingResolvers.get(p) ?? [];
      list.push(resolve);
      this.pendingResolvers.set(p, list);
      void this.drainQueue();
    });
  }

  private resolvePending(p: number): void {
    const list = this.pendingResolvers.get(p);
    if (!list) return;
    this.pendingResolvers.delete(p);
    for (const r of list) r();
  }

  private drainQueue(): void {
    while (this.inFlight.size < this.maxInflight && this.pendingQueue.length > 0) {
      const p = this.pendingQueue.pop();
      if (p === undefined) break;
      if (!this.pendingSet.has(p)) continue;
      this.pendingSet.delete(p);
      if (this.pages.has(p) || this.inFlight.has(p)) {
        this.resolvePending(p);
        continue;
      }
      void this.dispatchFetch(p);
    }
  }

  private dispatchFetch(p: number): Promise<void> {
    this.pageAbort.get(p)?.abort();
    const ac = new AbortController();
    this.pageAbort.set(p, ac);
    const offset = this.pageStartIndex(p);
    const promise = this.deps
      .fetchPage(offset, this.pageSize, ac.signal)
      .then((result: PageFetchResult) => {
        if (this.disposed || ac.signal.aborted) return;
        this._total = result.total;
        this.pages.set(p, result.rows);
        this.hotPages.add(p);
        this.evictOutsideBand(p);
        this.deps.onChange();
      })
      .catch((err: unknown) => {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }
        console.warn("[DataSource]", this.vizId, err);
      })
      .finally(() => {
        this.inFlight.delete(p);
        this.pageAbort.delete(p);
        this.resolvePending(p);
        this.drainQueue();
      });

    this.inFlight.set(p, promise);
    return promise;
  }

  /**
   * @param protectPage - Page index just loaded; not evicted until no other victim exists
   *   (avoids insert-then-immediate-evict when hotPages still spans an old wide range).
   */
  private evictOutsideBand(protectPage?: number): void {
    if (this.hotPages.size === 0) return;

    let pMin = Infinity;
    let pMax = -Infinity;
    for (const p of this.hotPages) {
      if (p < pMin) pMin = p;
      if (p > pMax) pMax = p;
    }

    const low = pMin - this.overscanPages;
    const high = pMax + this.overscanPages;

    for (const p of [...this.pages.keys()]) {
      if (p < low || p > high) {
        if (p === protectPage) continue;
        this.pages.delete(p);
        this.hotPages.delete(p);
      }
    }

    const center = (pMin + pMax) / 2;
    let protect = protectPage;
    while (this.pages.size > this.bandPages) {
      let maxDist = -1;
      for (const p of this.pages.keys()) {
        maxDist = Math.max(maxDist, Math.abs(p - center));
      }
      let victim = Infinity;
      for (const p of this.pages.keys()) {
        if (p === protect) continue;
        if (Math.abs(p - center) === maxDist && p < victim) {
          victim = p;
        }
      }
      if (victim === Infinity) {
        if (protect !== undefined) {
          protect = undefined;
          continue;
        }
        break;
      }
      this.pages.delete(victim);
      this.hotPages.delete(victim);
    }
  }

  /** Clears cache and totals; caller should call `ensurePage(0)` to reload. */
  reset(): void {
    for (const ac of this.pageAbort.values()) {
      ac.abort();
    }
    this.pageAbort.clear();
    this.pages.clear();
    this.inFlight.clear();
    this.hotPages.clear();
    this.pendingQueue.length = 0;
    this.pendingSet.clear();
    this.pendingResolvers.clear();
    this._total = 0;
    this.deps.onChange();
  }

  dispose(): void {
    unregisterDataSource(this.vizId);
    this.disposed = true;
    for (const ac of this.pageAbort.values()) {
      ac.abort();
    }
    this.pageAbort.clear();
    this.pages.clear();
    this.inFlight.clear();
    this.hotPages.clear();
    this.pendingQueue.length = 0;
    this.pendingSet.clear();
    this.pendingResolvers.clear();
    this._total = 0;
  }
}
