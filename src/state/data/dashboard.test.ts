import { describe, expect, it } from "vitest";

import type { DashboardRecord } from "@/core/rpc/data-contract";
import {
  appendDashboard,
  buildDashboardRecord,
  createDefaultMainDashboard,
  findDashboardById,
  nextDashboardName,
  resolveActiveDashboard,
} from "./dashboard.helpers";

describe("dashboard state helpers", () => {
  it("createDefaultMainDashboard has stable id and chart-table template", () => {
    const d = createDefaultMainDashboard();
    expect(d.id).toBe("dashboard-main");
    expect(d.name).toBe("Main");
    expect(d.templateId).toBe("chart-table");
  });

  it("buildDashboardRecord creates blank dashboard", () => {
    const r = buildDashboardRecord({ name: "Sales", templateId: "blank" });
    expect(r.name).toBe("Sales");
    expect(r.templateId).toBe("blank");
    expect(r.id).toBeTruthy();
  });

  it("buildDashboardRecord clones from source when copy template", () => {
    const source: DashboardRecord = {
      id: "src",
      name: "Ops",
      templateId: "analytics",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const r = buildDashboardRecord(
      { name: "", templateId: "copy", copiedFromId: "src" },
      source,
    );
    expect(r.name).toBe("Copy of Ops");
    expect(r.templateId).toBe("analytics");
    expect(r.copiedFromId).toBe("src");
  });

  it("buildDashboardRecord rejects empty name", () => {
    expect(() =>
      buildDashboardRecord({ name: "   ", templateId: "blank" }),
    ).toThrow("Dashboard name is required");
  });

  it("appendDashboard and findDashboardById", () => {
    const a = createDefaultMainDashboard();
    const b = buildDashboardRecord({ name: "B", templateId: "blank" });
    const list = appendDashboard([a], b);
    expect(list).toHaveLength(2);
    expect(findDashboardById(list, b.id)?.name).toBe("B");
  });

  it("resolveActiveDashboard falls back to first when id missing", () => {
    const a = createDefaultMainDashboard();
    const b = buildDashboardRecord({ name: "B", templateId: "blank" });
    const list = [a, b];
    expect(resolveActiveDashboard(list, "missing")?.id).toBe(a.id);
    expect(resolveActiveDashboard(list, b.id)?.id).toBe(b.id);
  });

  it("nextDashboardName increments", () => {
    const a = createDefaultMainDashboard();
    expect(nextDashboardName([a])).toBe("Dashboard 2");
  });
});
