import type { timeseriesdata } from "@/types/data.types";
import type { AggregateMethod } from "@/core/rpc/data-contract";

function xMs(d: timeseriesdata): number {
  const x = d.x;
  if (x instanceof Date) return x.getTime();
  return Date.parse(String(x));
}

function toPoint(t0: number, y: number): timeseriesdata {
  return { x: new Date(t0).toISOString(), y };
}

/**
 * Bucket `data` (sorted asc by x) into `bucketCount` intervals over [fromMs, toMs].
 */
export function bucketAggregate(
  data: timeseriesdata[],
  fromMs: number,
  toMs: number,
  bucketCount: number,
  method: AggregateMethod,
): timeseriesdata[] {
  if (data.length === 0 || bucketCount <= 0) return [];
  const span = toMs - fromMs;
  if (span <= 0) {
    const y =
      method === "minMax"
        ? data.reduce(
            (acc, p) => {
              const yy = p.y;
              return { min: Math.min(acc.min, yy), max: Math.max(acc.max, yy) };
            },
            { min: data[0]!.y, max: data[0]!.y },
          )
        : { min: 0, max: 0 };
    if (method === "minMax") {
      return [
        toPoint(fromMs, y.min),
        toPoint(fromMs, y.max),
      ];
    }
    const mean = data.reduce((s, p) => s + p.y, 0) / data.length;
    return [toPoint(fromMs, mean)];
  }

  const width = span / bucketCount;
  const out: timeseriesdata[] = [];

  for (let b = 0; b < bucketCount; b++) {
    const start = fromMs + b * width;
    const end = start + width;
    let sum = 0;
    let count = 0;
    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;

    for (const p of data) {
      const tx = xMs(p);
      if (tx < start) continue;
      if (tx >= end) break;
      const yy = p.y;
      sum += yy;
      count++;
      if (yy < minY) {
        minY = yy;
        minX = tx;
      }
      if (yy > maxY) {
        maxY = yy;
        maxX = tx;
      }
    }

    const tMid = start + width / 2;
    if (count === 0) continue;

    if (method === "mean") {
      out.push(toPoint(tMid, sum / count));
    } else if (method === "minMax") {
      if (minX <= maxX) {
        out.push(toPoint(minX, minY));
        if (maxX !== minX || maxY !== minY) out.push(toPoint(maxX, maxY));
      }
    } else {
      out.push(toPoint(tMid, sum / count));
    }
  }

  return out;
}
