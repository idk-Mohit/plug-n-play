import type { timeseriesdata } from "@/types/data.types";

const DEFAULT_STEP_MS = 1000;

function defaultTimestamps(count: number): Date[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) =>
    new Date(now - (count - i) * DEFAULT_STEP_MS),
  );
}

/** Main-thread sample series (no worker/WASM dependency). */
export function generateSampleSeriesSync(count: number): timeseriesdata[] {
  const n = Math.max(count, 1);
  const xs = defaultTimestamps(count);
  return xs.map((x, i) => ({
    x,
    y: Math.sin((i / n) * 2 * Math.PI) * 100 + Math.random() * 10,
  }));
}
