import { describe, expect, it } from "vitest";

import { lttb } from "./lttb";
import type { timeseriesdata } from "@/types/data.types";

function series(n: number): timeseriesdata[] {
  const t0 = Date.UTC(2024, 0, 1);
  return Array.from({ length: n }, (_, i) => ({
    x: new Date(t0 + i * 60_000).toISOString(),
    y: Math.sin(i / 4) * 10 + i * 0.1,
  }));
}

describe("lttb", () => {
  it("returns input when under threshold", () => {
    const s = series(10);
    expect(lttb(s, 20)).toEqual(s);
  });

  it("reduces to threshold length for larger series", () => {
    const s = series(100);
    const out = lttb(s, 20);
    expect(out.length).toBe(20);
    expect(out[0]).toEqual(s[0]);
    expect(out[out.length - 1]).toEqual(s[s.length - 1]);
  });
});
