import type { timeseriesdata } from "@/types/data.types";

function xMs(d: timeseriesdata): number {
  const x = d.x;
  if (x instanceof Date) return x.getTime();
  return Date.parse(String(x));
}

/**
 * Largest-Triangle-Three-Buckets downsampling (classic implementation).
 * @param data — sorted ascending by x
 * @param threshold — target point count (>= 2)
 */
export function lttb(
  data: timeseriesdata[],
  threshold: number,
): timeseriesdata[] {
  if (threshold >= data.length || threshold <= 2) return data.slice();
  const sampled: timeseriesdata[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);
  let a = 0;
  sampled.push(data[a]!);
  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      data.length,
    );
    const bucket = data.slice(rangeStart, rangeEnd);
    if (bucket.length === 0) continue;

    const avgX =
      bucket.reduce((s, p) => s + xMs(p), 0) / bucket.length;
    const avgY = bucket.reduce((s, p) => s + p.y, 0) / bucket.length;

    const ax = xMs(data[a]!);
    const ay = data[a]!.y;
    let maxArea = -1;
    let maxIdx = rangeStart;
    for (let j = 0; j < bucket.length; j++) {
      const p = bucket[j]!;
      const area = Math.abs(
        (ax - avgX) * (p.y - ay) - (ax - xMs(p)) * (avgY - ay),
      );
      if (area > maxArea) {
        maxArea = area;
        maxIdx = rangeStart + j;
      }
    }
    const next = data[maxIdx]!;
    sampled.push(next);
    a = maxIdx;
  }
  sampled.push(data[data.length - 1]!);
  return sampled;
}
