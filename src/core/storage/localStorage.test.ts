import { describe, expect, it } from "vitest";

import { stubLocalStorageForTests } from "@/test/local-storage-mock";

import { listDatasets, metaDataFromDatasetId } from "./localStorage";

describe("localStorage datasources helpers", () => {
  stubLocalStorageForTests();

  it("listDatasets returns empty array when key missing", () => {
    expect(listDatasets()).toEqual([]);
  });

  it("listDatasets maps id and name from stored JSON array", () => {
    localStorage.setItem(
      "datasources",
      JSON.stringify([
        { id: "a", name: "Alpha" },
        { id: "b" },
      ]),
    );
    expect(listDatasets()).toEqual([
      { id: "a", name: "Alpha" },
      { id: "b", name: "b" },
    ]);
  });

  it("listDatasets returns empty array on invalid JSON shape", () => {
    localStorage.setItem("datasources", JSON.stringify({ not: "array" }));
    expect(listDatasets()).toEqual([]);
  });

  it("metaDataFromDatasetId returns matching row or null", () => {
    localStorage.setItem(
      "datasources",
      JSON.stringify([{ id: "x-1", name: "X", extra: 1 }]),
    );
    expect(metaDataFromDatasetId("x-1" as import("@/types/data.types").uuid)).toEqual({
      id: "x-1",
      name: "X",
      extra: 1,
    });
    expect(
      metaDataFromDatasetId("missing" as import("@/types/data.types").uuid),
    ).toBeNull();
  });
});
