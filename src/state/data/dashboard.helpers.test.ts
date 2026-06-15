import { describe, expect, it } from "vitest";

import { ChartType } from "@/enums/chart.enums";
import {
  buildDashboardRecord,
  createDefaultMainDashboard,
  resolveActiveDashboard,
  updateDashboardRecord,
} from "@/state/data/dashboard.helpers";
import {
  addPanelToDashboard,
  clonePanelsForCopy,
  getDefaultPanelsForTemplate,
  normalizeDashboardRecord,
  removePanelFromDashboard,
  tablePanelVizId,
} from "@/state/data/dashboard-layout";

describe("normalizeDashboardRecord", () => {
  it("defaults chart-table template to chart + table panels", () => {
    const record = normalizeDashboardRecord({
      id: "d1",
      name: "Main",
      templateId: "chart-table",
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z",
    });
    expect(record.panels).toHaveLength(2);
    expect(record.panels![0]).toMatchObject({
      id: "chart-1",
      type: "chart",
      chartType: ChartType.LINE,
      order: 0,
    });
    expect(record.panels![1]).toMatchObject({
      id: "table-1",
      type: "table",
      order: 1,
    });
  });

  it("defaults blank template to empty panels", () => {
    const record = normalizeDashboardRecord({
      id: "d2",
      name: "Blank",
      templateId: "blank",
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z",
    });
    expect(record.panels).toEqual([]);
  });
});

describe("buildDashboardRecord", () => {
  it("seeds panels for chart-table template", () => {
    const record = buildDashboardRecord({
      name: "Ops",
      templateId: "chart-table",
    });
    expect(record.panels).toHaveLength(2);
  });

  it("clones panels when copying an existing dashboard", () => {
    const source = createDefaultMainDashboard();
    const copy = buildDashboardRecord(
      { name: "Copy", templateId: "copy", copiedFromId: source.id },
      source,
    );
    expect(copy.panels).toHaveLength(2);
    expect(copy.panels!.map((p) => p.id)).not.toEqual(
      source.panels!.map((p) => p.id),
    );
  });
});

describe("panel mutations", () => {
  const base = normalizeDashboardRecord({
    id: "d1",
    name: "Blank",
    templateId: "blank",
    panels: [],
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
  });

  it("adds and removes panels", () => {
    const withChart = addPanelToDashboard(base, {
      id: "chart-x",
      type: "chart",
      chartType: ChartType.BAR,
    });
    expect(withChart.panels).toHaveLength(1);

    const removed = removePanelFromDashboard(withChart, "chart-x");
    expect(removed.panels).toEqual([]);
  });
});

describe("updateDashboardRecord", () => {
  it("updates name and bumps updatedAt", () => {
    const dashboards = [
      normalizeDashboardRecord({
        id: "d-rename",
        name: "Before",
        templateId: "blank",
        createdAt: "2020-01-01T00:00:00.000Z",
        updatedAt: "2020-01-01T00:00:00.000Z",
      }),
    ];
    const next = updateDashboardRecord(dashboards, "d-rename", {
      name: "Renamed",
    });
    expect(next[0]?.name).toBe("Renamed");
    expect(next[0]?.updatedAt).not.toBe("2020-01-01T00:00:00.000Z");
  });
});

describe("resolveActiveDashboard", () => {
  it("normalizes panels on resolve", () => {
    const dashboards = [
      {
        id: "legacy",
        name: "Legacy",
        templateId: "chart-table" as const,
        createdAt: "2020-01-01T00:00:00.000Z",
        updatedAt: "2020-01-01T00:00:00.000Z",
      },
    ];
    const active = resolveActiveDashboard(dashboards, "legacy");
    expect(active?.panels).toHaveLength(2);
  });
});

describe("getDefaultPanelsForTemplate", () => {
  it("returns empty for blank", () => {
    expect(getDefaultPanelsForTemplate("blank")).toEqual([]);
  });
});

describe("clonePanelsForCopy", () => {
  it("assigns new panel ids", () => {
    const source = createDefaultMainDashboard();
    const cloned = clonePanelsForCopy(source);
    expect(cloned).toHaveLength(2);
    expect(cloned[0]?.id).not.toBe(source.panels![0]?.id);
  });
});

describe("tablePanelVizId", () => {
  it("scopes DataSource identity per panel, not per dataset", () => {
    expect(tablePanelVizId("table-1")).toBe("table:table-1");
    expect(tablePanelVizId("table-2")).toBe("table:table-2");
    expect(tablePanelVizId("table-1")).not.toBe(tablePanelVizId("table-2"));
  });
});
