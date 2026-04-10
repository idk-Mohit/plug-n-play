import type { DatasetMeta } from "@/state/data/dataset";

/** Point count for the built-in sample series (must match chart/table expectations). */
export const DEFAULT_SAMPLE_POINT_COUNT = 250;

/** Stable id for the built-in sample — not stored in IndexedDB; data is generated in the worker. */
export const DEFAULT_SAMPLE_DATASET_ID = "plug-play-default-sample";

export function isDefaultSampleDatasetId(id: string | undefined | null): boolean {
  return id === DEFAULT_SAMPLE_DATASET_ID;
}

export function createDefaultSampleDatasetMeta(): DatasetMeta {
  return {
    id: DEFAULT_SAMPLE_DATASET_ID,
    name: "Sample time series",
    type: "json",
    size: "—",
    records: DEFAULT_SAMPLE_POINT_COUNT,
    uploadDate: new Date().toISOString(),
    preview: [],
    storageKey: `dataset:${DEFAULT_SAMPLE_DATASET_ID}`,
  };
}
