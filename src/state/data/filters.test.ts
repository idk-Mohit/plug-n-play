import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import {
  createFilter,
  globalFiltersAtom,
  vizFiltersAtomFamily,
} from "./filters";

describe("filters state", () => {
  it("createFilter applies defaults", () => {
    const f = createFilter();
    expect(f.id).toBeTruthy();
    expect(f.field).toBe("y");
    expect(f.op).toBe("gt");
    expect(f.value).toBe(0);
  });

  it("createFilter merges partial overrides", () => {
    const f = createFilter({ field: "region", op: "eq", value: "EU" });
    expect(f.field).toBe("region");
    expect(f.op).toBe("eq");
    expect(f.value).toBe("EU");
  });

  it("vizFiltersAtomFamily scopes filters per visualization id", () => {
    const store = createStore();
    const chartA = vizFiltersAtomFamily("chart-a");
    const chartB = vizFiltersAtomFamily("chart-b");

    store.set(chartA, [createFilter({ field: "y", op: "gt", value: 10 })]);
    store.set(chartB, [createFilter({ field: "y", op: "lt", value: 5 })]);

    expect(store.get(chartA)).toHaveLength(1);
    expect(store.get(chartB)).toHaveLength(1);
    expect(store.get(chartA)[0]?.op).toBe("gt");
    expect(store.get(chartB)[0]?.op).toBe("lt");
  });

  it("globalFiltersAtom stays separate from per-viz filters", () => {
    const store = createStore();
    store.set(globalFiltersAtom, [createFilter({ op: "eq", value: "all" })]);
    store.set(vizFiltersAtomFamily("chart-1"), [
      createFilter({ op: "gt", value: 1 }),
    ]);

    expect(store.get(globalFiltersAtom)[0]?.value).toBe("all");
    expect(store.get(vizFiltersAtomFamily("chart-1"))[0]?.value).toBe(1);
  });
});
