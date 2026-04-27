/**
 * Typed payloads for `Data.*` RPC methods (UI ↔ engine worker).
 * Uses plain JSON-serializable fields (timestamps as epoch ms).
 */

import type { timeseriesdata } from "@/types/data.types";

/** Downsampling strategy for chart windows. */
export type AggregateMethod = "lttb" | "minMax" | "mean";

export type DataDatasetMeta = {
  rowCount: number;
  /** Inclusive domain in epoch ms; nulls if empty or non-time series. */
  xRange: [number, number] | null;
};

export type DataGetMetaArgs = string;

export type DataGetPreviewArgs = {
  datasetId: string;
  limit: number;
};

export type DataGetRangeArgs = {
  datasetId: string;
  fromMs: number;
  toMs: number;
  /** Max rows after filter (optional safety cap). */
  limit?: number;
  /** "asc" | "desc" by time — default asc */
  order?: "asc" | "desc";
};

export type DataGetPageArgs = {
  datasetId: string;
  offset: number;
  limit: number;
};

export type DataGetAggregatedArgs = {
  datasetId: string;
  fromMs: number;
  toMs: number;
  buckets: number;
  method: AggregateMethod;
};

export type DataSaveArgs = {
  datasetId: string;
  data: unknown;
};

export type DataDeleteArgs = string;

/** Manifest backup in IndexedDB (`datasources-manifest`). */
export type DataSaveManifestArgs = unknown[];

export type DataGetAggregatedResult = {
  points: timeseriesdata[];
};

/** Worker `System.heap` result (Chrome exposes heap sizes; other browsers may not). */
export type SystemHeapResult =
  | {
      t: number;
      used: number;
      total: number;
      limit: number;
    }
  | { t: number; unavailable: true };

/** Worker `System.stats` aggregate diagnostics. */
export type SystemStatsResult = {
  t: number;
  heap: { used: number; total: number; limit: number } | null;
  routeHits: Record<string, number>;
  lastError: { t: number; message: string } | null;
};
