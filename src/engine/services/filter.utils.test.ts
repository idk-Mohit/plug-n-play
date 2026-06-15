import { describe, expect, it } from "vitest";

import type { FilterDefinition } from "@/core/rpc/data-contract";
import type { timeseriesdata } from "@/types/data.types";

import {
  applyFiltersToRow,
  applyFiltersToTimeseries,
} from "./filter.utils";

function filter(
  partial: Omit<FilterDefinition, "id"> & { id?: string },
): FilterDefinition {
  return { id: partial.id ?? "f1", ...partial };
}

describe("applyFiltersToRow", () => {
  it("returns true when filters are empty or undefined", () => {
    expect(applyFiltersToRow({ y: 1 }, undefined)).toBe(true);
    expect(applyFiltersToRow({ y: 1 }, [])).toBe(true);
  });

  it("applies eq on numeric fields", () => {
    const row = { y: 10 };
    expect(
      applyFiltersToRow(row, [filter({ field: "y", op: "eq", value: 10 })]),
    ).toBe(true);
    expect(
      applyFiltersToRow(row, [filter({ field: "y", op: "eq", value: 9 })]),
    ).toBe(false);
  });

  it("applies gt and lt", () => {
    const row = { y: 50 };
    expect(
      applyFiltersToRow(row, [filter({ field: "y", op: "gt", value: 40 })]),
    ).toBe(true);
    expect(
      applyFiltersToRow(row, [filter({ field: "y", op: "gt", value: 50 })]),
    ).toBe(false);
    expect(
      applyFiltersToRow(row, [filter({ field: "y", op: "lt", value: 60 })]),
    ).toBe(true);
    expect(
      applyFiltersToRow(row, [filter({ field: "y", op: "lt", value: 50 })]),
    ).toBe(false);
  });

  it("applies between on numeric fields", () => {
    const row = { score: 25 };
    expect(
      applyFiltersToRow(row, [
        filter({
          field: "score",
          op: "between",
          value: { from: 20, to: 30 },
        }),
      ]),
    ).toBe(true);
    expect(
      applyFiltersToRow(row, [
        filter({
          field: "score",
          op: "between",
          value: { from: 26, to: 30 },
        }),
      ]),
    ).toBe(false);
  });

  it("applies contains case-insensitively", () => {
    const row = { label: "Hello World" };
    expect(
      applyFiltersToRow(row, [
        filter({ field: "label", op: "contains", value: "world" }),
      ]),
    ).toBe(true);
    expect(
      applyFiltersToRow(row, [
        filter({ field: "label", op: "contains", value: "missing" }),
      ]),
    ).toBe(false);
  });

  it("compares x as epoch ms for gt", () => {
    const row = { x: "2024-06-01T00:00:00.000Z", y: 1 };
    const fromMs = Date.parse("2024-05-01T00:00:00.000Z");
    expect(
      applyFiltersToRow(row, [filter({ field: "x", op: "gt", value: fromMs })]),
    ).toBe(true);
  });

  it("requires all filters to pass (AND)", () => {
    const row = { y: 100, region: "EU" };
    const filters = [
      filter({ field: "y", op: "gt", value: 50 }),
      filter({ field: "region", op: "eq", value: "EU" }),
    ];
    expect(applyFiltersToRow(row, filters)).toBe(true);
    expect(
      applyFiltersToRow(row, [
        ...filters.slice(0, 1),
        filter({ field: "region", op: "eq", value: "US" }),
      ]),
    ).toBe(false);
  });

  it("rejects non-object rows", () => {
    expect(
      applyFiltersToRow(null, [filter({ field: "y", op: "eq", value: 1 })]),
    ).toBe(false);
  });
});

describe("applyFiltersToTimeseries", () => {
  const rows: timeseriesdata[] = [
    { x: "2024-01-01", y: 10 },
    { x: "2024-01-02", y: 90 },
    { x: "2024-01-03", y: 30 },
  ];

  it("returns the same array reference when no filters", () => {
    expect(applyFiltersToTimeseries(rows, undefined)).toBe(rows);
    expect(applyFiltersToTimeseries(rows, [])).toBe(rows);
  });

  it("filters rows by y threshold", () => {
    const out = applyFiltersToTimeseries(rows, [
      filter({ field: "y", op: "gt", value: 50 }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.y).toBe(90);
  });
});
