import { describe, expect, it } from "vitest";

import { planQuery } from "@/engine/query.planner";

describe("planQuery", () => {
  it("routes meta intent to getMeta", () => {
    const plan = planQuery({ datasetId: "ds-1", intent: "meta" });
    expect(plan.route).toBe("Data.getMeta");
  });

  it("routes aggregated intent with defaults", () => {
    const plan = planQuery({
      datasetId: "ds-1",
      intent: "aggregated",
      aggregated: {
        fromMs: 0,
        toMs: 100,
        buckets: 64,
        method: "lttb",
      },
    });
    expect(plan.route).toBe("Data.getAggregated");
    if (plan.route === "Data.getAggregated") {
      expect(plan.args[0].buckets).toBe(64);
    }
  });
});
