import { describe, expect, it } from "vitest";

import type { DashboardRecord } from "@/core/rpc/data-contract";
import { createDefaultMainDashboard } from "./dashboard.helpers";
import { shouldDeferDashboardUrlFallback } from "./dashboard-view-sync.helpers";
import { mergePersistedDashboardsWithIndexedDb } from "./dashboard-storage";

describe("dashboard-storage merge", () => {
  const main = createDefaultMainDashboard();

  it("mergePersistedDashboardsWithIndexedDb prefers newer updatedAt", () => {
    const local: DashboardRecord[] = [
      {
        ...main,
        name: "Stale",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    const fromIdb: DashboardRecord[] = [
      {
        ...main,
        name: "Fresh",
        updatedAt: "2025-01-02T00:00:00.000Z",
      },
    ];
    const merged = mergePersistedDashboardsWithIndexedDb(local, fromIdb);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.name).toBe("Fresh");
  });

  it("mergePersistedDashboardsWithIndexedDb appends idb-only dashboards", () => {
    const other: DashboardRecord = {
      id: "other",
      name: "Other",
      templateId: "blank",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const merged = mergePersistedDashboardsWithIndexedDb([main], [other]);
    expect(merged.map((d) => d.id)).toEqual([main.id, other.id]);
  });
});

describe("shouldDeferDashboardUrlFallback", () => {
  const main = createDefaultMainDashboard();

  it("defers when hash id is missing locally and manifest is not hydrated", () => {
    expect(
      shouldDeferDashboardUrlFallback(false, "missing-id", [main]),
    ).toBe(true);
  });

  it("does not defer after hydration or when id exists", () => {
    expect(
      shouldDeferDashboardUrlFallback(true, "missing-id", [main]),
    ).toBe(false);
    expect(
      shouldDeferDashboardUrlFallback(false, main.id, [main]),
    ).toBe(false);
  });
});
