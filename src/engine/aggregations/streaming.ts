import type { timeseriesdata } from "@/types/data.types";
import type { AggregateMethod } from "@/core/rpc/data-contract";

import { bucketAggregate, lttb } from "@/engine/aggregations";

function xMs(d: timeseriesdata): number {
  const x = d.x;
  if (x instanceof Date) return x.getTime();
  return Date.parse(String(x));
}

function toPoint(t0: number, y: number): timeseriesdata {
  return { x: new Date(t0).toISOString(), y };
}

async function asyncIterToArray(
  iter: AsyncIterable<timeseriesdata>,
): Promise<timeseriesdata[]> {
  const out: timeseriesdata[] = [];
  for await (const p of iter) {
    out.push(p);
  }
  return out;
}

/**
 * Single-pass bucketing over a sorted (ascending by x) async stream.
 */
export async function streamingBucketAggregate(
  orderedPoints: AsyncIterable<timeseriesdata>,
  fromMs: number,
  toMs: number,
  bucketCount: number,
  method: AggregateMethod,
): Promise<timeseriesdata[]> {
  const span = toMs - fromMs;
  if (bucketCount <= 0) return [];

  if (span <= 0) {
    const buf: timeseriesdata[] = [];
    for await (const p of orderedPoints) {
      const tx = xMs(p);
      if (tx < fromMs || tx > toMs) continue;
      buf.push(p);
    }
    return bucketAggregate(buf, fromMs, toMs, bucketCount, method);
  }

  const width = span / bucketCount;
  type Bucket = {
    count: number;
    sum: number;
    minY: number;
    maxY: number;
    minX: number;
    maxX: number;
  };
  const buckets: (Bucket | null)[] = Array.from(
    { length: bucketCount },
    () => null,
  );

  for await (const p of orderedPoints) {
    const tx = xMs(p);
    if (tx < fromMs || tx > toMs) continue;
    const b = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor((tx - fromMs) / width)),
    );
    const yy = p.y;
    let slot = buckets[b];
    if (!slot) {
      slot = {
        count: 0,
        sum: 0,
        minY: Infinity,
        maxY: -Infinity,
        minX: Infinity,
        maxX: -Infinity,
      };
      buckets[b] = slot;
    }
    slot.count++;
    slot.sum += yy;
    if (yy < slot.minY) {
      slot.minY = yy;
      slot.minX = tx;
    }
    if (yy > slot.maxY) {
      slot.maxY = yy;
      slot.maxX = tx;
    }
  }

  const out: timeseriesdata[] = [];
  for (let b = 0; b < bucketCount; b++) {
    const slot = buckets[b];
    if (!slot || slot.count === 0) continue;
    const start = fromMs + b * width;
    const tMid = start + width / 2;
    if (method === "mean") {
      out.push(toPoint(tMid, slot.sum / slot.count));
    } else if (method === "minMax") {
      if (slot.minX <= slot.maxX) {
        out.push(toPoint(slot.minX, slot.minY));
        if (slot.maxX !== slot.minX || slot.maxY !== slot.minY) {
          out.push(toPoint(slot.maxX, slot.maxY));
        }
      }
    } else {
      out.push(toPoint(tMid, slot.sum / slot.count));
    }
  }
  return out;
}

/**
 * Streaming LTTB over points already sorted ascending by x.
 * Uses O(bucketSize) memory where bucketSize ≈ totalCount / threshold.
 */
export async function streamingLttb(
  orderedPoints: AsyncIterable<timeseriesdata>,
  totalCount: number,
  threshold: number,
): Promise<timeseriesdata[]> {
  if (threshold <= 2 || totalCount <= threshold) {
    const all = await asyncIterToArray(orderedPoints);
    return lttb(all, threshold);
  }

  const bucketSize = (totalCount - 2) / (threshold - 2);
  const it = orderedPoints[Symbol.asyncIterator]();
  let pos = 0;
  let lastInStream: timeseriesdata | null = null;

  async function readNext(): Promise<timeseriesdata | null> {
    const r = await it.next();
    if (r.done) return null;
    pos++;
    lastInStream = r.value;
    return r.value;
  }

  const first = await readNext();
  if (!first) return [];

  const sampled: timeseriesdata[] = [first];
  let aPoint = first;

  async function skipTo(index: number): Promise<void> {
    while (pos < index) {
      const n = await readNext();
      if (!n) return;
    }
  }

  /** Read half-open index range [startIdx, endIdx) like `Array.slice`. */
  async function readSlice(
    startIdx: number,
    endIdx: number,
  ): Promise<timeseriesdata[]> {
    await skipTo(startIdx);
    const buf: timeseriesdata[] = [];
    const want = endIdx - startIdx;
    for (let k = 0; k < want; k++) {
      const n = await readNext();
      if (!n) break;
      buf.push(n);
    }
    return buf;
  }

  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      totalCount,
    );
    const bucket = await readSlice(rangeStart, rangeEnd);
    if (bucket.length === 0) continue;

    const avgX =
      bucket.reduce((s, p) => s + xMs(p), 0) / bucket.length;
    const avgY = bucket.reduce((s, p) => s + p.y, 0) / bucket.length;

    const ax = xMs(aPoint);
    const ay = aPoint.y;
    let maxArea = -1;
    let pickJ = 0;
    for (let j = 0; j < bucket.length; j++) {
      const p = bucket[j]!;
      const area = Math.abs(
        (ax - avgX) * (p.y - ay) - (ax - xMs(p)) * (avgY - ay),
      );
      if (area > maxArea) {
        maxArea = area;
        pickJ = j;
      }
    }

    const chosen = bucket[pickJ]!;
    sampled.push(chosen);
    aPoint = chosen;
  }

  if (lastInStream && totalCount > 0) {
    sampled.push(lastInStream);
  }

  return sampled;
}
