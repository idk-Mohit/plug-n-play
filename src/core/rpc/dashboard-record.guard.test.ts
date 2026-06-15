import { describe, expect, it } from "vitest";

import { ChartType } from "@/enums/chart.enums";
import {
  isDashboardManifest,
  isValidDashboardRecord,
  parseDashboardManifest,
} from "@/core/rpc/dashboard-record.guard";

describe("dashboard-record.guard", () => {
  const valid = {
    id: "d1",
    name: "Main",
    templateId: "blank",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("accepts a valid record", () => {
    expect(isValidDashboardRecord(valid)).toBe(true);
  });

  it("rejects empty name and unknown templateId", () => {
    expect(isValidDashboardRecord({ ...valid, name: "" })).toBe(false);
    expect(isValidDashboardRecord({ ...valid, templateId: "nope" })).toBe(false);
  });

  it("accepts valid panels and rejects malformed panel entries", () => {
    const withPanels = {
      ...valid,
      panels: [
        { id: "chart-1", type: "chart", chartType: ChartType.LINE, order: 0 },
        { id: "table-1", type: "table", order: 1 },
      ],
    };
    expect(isValidDashboardRecord(withPanels)).toBe(true);

    expect(
      isValidDashboardRecord({
        ...valid,
        panels: [{ id: "", type: "table", order: 0 }],
      }),
    ).toBe(false);
    expect(
      isValidDashboardRecord({
        ...valid,
        panels: [{ id: "t1", type: "table", order: Number.NaN }],
      }),
    ).toBe(false);
    expect(
      isValidDashboardRecord({
        ...valid,
        panels: [
          { id: "c1", type: "chart", chartType: "not-a-chart", order: 0 },
        ],
      }),
    ).toBe(false);
    expect(
      isValidDashboardRecord({
        ...valid,
        panels: [{ id: "x1", type: "widget", order: 0 }],
      }),
    ).toBe(false);
  });

  it("parseDashboardManifest filters invalid rows", () => {
    expect(parseDashboardManifest([valid, { bad: true }])).toEqual([valid]);
  });

  it("isDashboardManifest requires all rows valid", () => {
    expect(isDashboardManifest([valid])).toBe(true);
    expect(isDashboardManifest([valid, { bad: true }])).toBe(false);
  });
});
