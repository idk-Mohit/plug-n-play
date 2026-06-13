import { describe, expect, it } from "vitest";

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

  it("parseDashboardManifest filters invalid rows", () => {
    expect(parseDashboardManifest([valid, { bad: true }])).toEqual([valid]);
  });

  it("isDashboardManifest requires all rows valid", () => {
    expect(isDashboardManifest([valid])).toBe(true);
    expect(isDashboardManifest([valid, { bad: true }])).toBe(false);
  });
});
