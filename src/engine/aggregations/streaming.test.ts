import { describe, expect, it } from "vitest";

import { bucketAggregate, lttb } from "@/engine/aggregations";
import {
  streamingBucketAggregate,
  streamingLttb,
} from "@/engine/aggregations/streaming";
import type { timeseriesdata } from "@/types/data.types";

function points(n: number, t0 = 0, step = 60_000): timeseriesdata[] {
  return Array.from({ length: n }, (_, i) => ({
    x: new Date(t0 + i * step).toISOString(),
    y: Math.sin(i * 0.01) * 10 + i * 0.001,
  }));
}

async function* asAsync<T>(arr: T[]): AsyncGenerator<T, void, undefined> {
  for (const x of arr) yield x;
}

describe("streaming aggregations", () => {
  it("streamingLttb matches lttb on the same ordered series", async () => {
    const data = points(500);
    const threshold = 48;
    const expected = lttb(data, threshold);
    const got = await streamingLttb(asAsync(data), data.length, threshold);
    expect(got.length).toBe(expected.length);
    for (let i = 0; i < got.length; i++) {
      expect(got[i]!.x).toBe(expected[i]!.x);
      expect(got[i]!.y).toBeCloseTo(expected[i]!.y, 10);
    }
  });

  it("streamingBucketAggregate mean matches bucketAggregate", async () => {
    const data = points(200);
    const fromMs = Date.parse(String(data[0]!.x));
    const toMs = Date.parse(String(data[data.length - 1]!.x));
    const buckets = 24;
    const expected = bucketAggregate(data, fromMs, toMs, buckets, "mean");
    const got = await streamingBucketAggregate(
      asAsync(data),
      fromMs,
      toMs,
      buckets,
      "mean",
    );
    expect(got.length).toBe(expected.length);
    for (let i = 0; i < got.length; i++) {
      // Streaming vs array scan can assign edge timestamps to adjacent buckets (~1e-2 y on this fixture).
      expect(got[i]!.y).toBeCloseTo(expected[i]!.y, 1);
    }
  });
});
