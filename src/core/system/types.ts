export type HeapSnapshot = {
  used: number;
  total: number;
  limit: number;
};

/** One sampler tick for the Activity system monitor. */
export type SystemSample = {
  t: number;
  heap?: HeapSnapshot;
  workerHeap?: HeapSnapshot;
  longTaskMs: number;
  longTaskCount: number;
  fps: number;
  rpcInflight: number;
  rpcLastRttMs?: number;
  dataSources: Array<{
    vizId: string;
    pages: number;
    hot: number;
    total: number;
    inflight: number;
  }>;
  storage?: { quota: number; usage: number };
  localStorageBytes: number;
  visibility: DocumentVisibilityState;
  wasDiscarded: boolean;
  idbDatabases?: Array<{ name?: string; version?: number }>;
};
