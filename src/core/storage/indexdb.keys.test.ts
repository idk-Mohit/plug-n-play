import { describe, expect, it } from "vitest";

import { isDatasetObjectStoreKey } from "./indexdb";

describe("isDatasetObjectStoreKey", () => {
  it("accepts dataset:* string keys", () => {
    expect(isDatasetObjectStoreKey("dataset:abc")).toBe(true);
  });

  it("rejects non-strings and other keys", () => {
    expect(isDatasetObjectStoreKey("manifest")).toBe(false);
    expect(isDatasetObjectStoreKey("dataset")).toBe(false);
    expect(isDatasetObjectStoreKey(1)).toBe(false);
    expect(isDatasetObjectStoreKey(null)).toBe(false);
  });
});
