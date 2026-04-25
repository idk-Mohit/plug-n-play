import { describe, expect, it } from "vitest";

import { hashCartesianData } from "./utils";
import type { timeseriesdata } from "@/types/data.types";

describe("hashCartesianData", () => {
  it("returns empty JSON array fingerprint for empty data", () => {
    expect(hashCartesianData([])).toBe("[]");
  });

  it("concatenates x-y pairs and truncates to 500 chars", () => {
    const many: timeseriesdata[] = Array.from({ length: 200 }, (_, i) => ({
      x: i.toString(),
      y: i * 2,
    }));
    const h = hashCartesianData(many);
    expect(h.length).toBeLessThanOrEqual(500);
    expect(h.startsWith("[\"")).toBe(true);
  });

  it("is stable for the same series", () => {
    const data = [
      { x: "1", y: 2 },
      { x: "3", y: 4 },
    ];
    expect(hashCartesianData(data)).toBe(hashCartesianData(data));
  });
});
