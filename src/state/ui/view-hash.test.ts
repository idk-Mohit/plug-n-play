import { describe, expect, it } from "vitest";

import { dashboardViewState, parseViewFromHash } from "@/state/ui/view-hash";

describe("view-hash", () => {
  it("dashboardViewState builds dashboard meta", () => {
    expect(dashboardViewState("abc")).toEqual({
      view: "dashboard",
      meta: { dashboardId: "abc" },
    });
  });

  it("parseViewFromHash reads dashboardId from hash query", () => {
    expect(parseViewFromHash("#dashboard?dashboardId=abc")).toEqual({
      view: "dashboard",
      meta: { dashboardId: "abc" },
    });
  });

  it("parseViewFromHash rejects unknown views", () => {
    expect(parseViewFromHash("#not-a-view")).toBeNull();
    expect(parseViewFromHash("#")).toBeNull();
  });
});
