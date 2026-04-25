/**
 * Policy for memory-bounded paged table data (see docs/design/memory-bounded-data-source.md).
 */
export type DataSourcePolicy = {
  /** Rows per fetch; must stay within worker clamp (max 500). Default 50. */
  pageSize?: number;
  /** Max full pages retained in memory. Default 10. */
  bandPages?: number;
  /** Extra pages kept beyond min/max hot page. Default 1. */
  overscanPages?: number;
};

export type GetRowResult<Row> =
  | { state: "loaded"; row: Row }
  | { state: "pending" };

/** Result shape aligned with `Data.getPage` RPC. */
export type PageFetchResult = {
  rows: unknown[];
  total: number;
  offset: number;
  limit: number;
};

export type DataSourceDeps = {
  fetchPage: (offset: number, limit: number) => Promise<PageFetchResult>;
  onChange: () => void;
};
