import { describe, expect, it } from "vitest";

import {
  getActivityChartWindowMs,
  sliceHistoryForActivityCharts,
} from "./activityChartWindow";
import type { SystemSample } from "./types";

function sample(t: number): SystemSample {
  return {
    t,
    longTaskMs: 0,
    longTaskCount: 0,
    fps: 60,
    rpcInflight: 0,
    dataSources: [],
    localStorageBytes: 0,
    visibility: "visible",
    wasDiscarded: false,
  };
}

describe("getActivityChartWindowMs", () => {
  it("maps sampler intervals to chart windows", () => {
    expect(getActivityChartWindowMs(1_000)).toBe(15_000);
    expect(getActivityChartWindowMs(5_000)).toBe(60_000);
    expect(getActivityChartWindowMs(10_000)).toBe(120_000);
    expect(getActivityChartWindowMs(30_000)).toBe(300_000);
  });
});

describe("sliceHistoryForActivityCharts", () => {
  it("keeps samples within window from last timestamp", () => {
    const history = [sample(1_000), sample(100_000)];
    const sliced = sliceHistoryForActivityCharts(history, 1_000);
    expect(sliced).toHaveLength(1);
    expect(sliced[0]!.t).toBe(100_000);
  });
});
