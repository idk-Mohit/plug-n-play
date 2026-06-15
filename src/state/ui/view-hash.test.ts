import { describe, expect, it } from "vitest";

import {
  dashboardViewState,
  datasetViewState,
  parseViewFromHash,
} from "@/state/ui/view-hash";

describe("view-hash", () => {
  it("dashboardViewState builds dashboard meta", () => {
    expect(dashboardViewState("abc")).toEqual({
      view: "dashboard",
      meta: { dashboardId: "abc" },
    });
  });

  it("datasetViewState builds dataset meta", () => {
    expect(datasetViewState("ds-1")).toEqual({
      view: "dataset",
      meta: { datasetId: "ds-1", tab: "preview" },
    });
  });

  it("parseViewFromHash reads dashboardId from hash query", () => {
    expect(parseViewFromHash("#dashboard?dashboardId=abc")).toEqual({
      view: "dashboard",
      meta: { dashboardId: "abc" },
    });
  });

  it("parseViewFromHash reads bare view routes", () => {
    expect(parseViewFromHash("#visuals")).toEqual({
      view: "visuals",
      meta: undefined,
    });
    expect(parseViewFromHash("#dataset?datasetId=ds-1&tab=preview")).toEqual({
      view: "dataset",
      meta: { datasetId: "ds-1", tab: "preview" },
    });
  });

  it("parseViewFromHash rejects unknown views", () => {
    expect(parseViewFromHash("#not-a-view")).toBeNull();
    expect(parseViewFromHash("#")).toBeNull();
  });
});
