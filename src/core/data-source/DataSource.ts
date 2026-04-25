import type {
  DataSourceDeps,
  DataSourcePolicy,
  GetRowResult,
  PageFetchResult,
} from "@/core/data-source/types";

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_BAND_PAGES = 10;
const DEFAULT_OVERSCAN_PAGES = 1;

export class DataSource<Row = unknown> {
  readonly pageSize: number;
  readonly bandPages: number;
  readonly overscanPages: number;

  private readonly deps: DataSourceDeps;
  private disposed = false;

  /** Page index -> rows for that page (length <= pageSize on last page). */
  private readonly pages = new Map<number, unknown[]>();
  private readonly inFlight = new Map<number, Promise<void>>();
  /** Pages touched by getRow since last interest tracking; trimmed when pages evicted. */
  private readonly hotPages = new Set<number>();

  private _total = 0;

  constructor(policy: DataSourcePolicy | undefined, deps: DataSourceDeps) {
    this.pageSize = policy?.pageSize ?? DEFAULT_PAGE_SIZE;
    this.bandPages = policy?.bandPages ?? DEFAULT_BAND_PAGES;
    this.overscanPages = policy?.overscanPages ?? DEFAULT_OVERSCAN_PAGES;
    this.deps = deps;
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

    const offset = this.pageStartIndex(p);
    const promise = this.deps
      .fetchPage(offset, this.pageSize)
      .then((result: PageFetchResult) => {
        if (this.disposed) return;
        this._total = result.total;
        this.pages.set(p, result.rows);
        this.hotPages.add(p);
        this.inFlight.delete(p);
        this.evictOutsideBand(p);
        this.deps.onChange();
      })
      .catch(() => {
        this.inFlight.delete(p);
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
    this.pages.clear();
    this.inFlight.clear();
    this.hotPages.clear();
    this._total = 0;
    this.deps.onChange();
  }

  dispose(): void {
    this.disposed = true;
    this.pages.clear();
    this.inFlight.clear();
    this.hotPages.clear();
    this._total = 0;
  }
}
