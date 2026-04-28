import type { SystemSample } from "./types";

/**
 * How far back Activity **charts** show data, based on sampler interval.
 * Longer intervals → longer wall-clock window; export/history buffer is unchanged.
 */
export function getActivityChartWindowMs(intervalMs: number): number {
  if (intervalMs <= 1_000) return 15_000; // 1s → 15s visible
  if (intervalMs <= 5_000) return 60_000; // 5s → up to 1 min
  if (intervalMs <= 10_000) return 120_000; // 10s → 2 min
  return 300_000; // 30s+ → 5 min
}

/** Trim samples to the chart window using the latest sample as the right edge. */
export function sliceHistoryForActivityCharts(
  history: SystemSample[],
  intervalMs: number,
): SystemSample[] {
  if (history.length === 0) return history;
  const windowMs = getActivityChartWindowMs(intervalMs);
  const endT = history[history.length - 1]!.t;
  const startT = endT - windowMs;
  return history.filter((s) => s.t >= startT);
}
