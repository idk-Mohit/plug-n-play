import { describe, expect, it, vi } from "vitest";

import { getGradientFill, validateJsonDataset } from "./commonFunctions";

describe("getGradientFill", () => {
  it("normalizes space-separated hsl() and applies alpha", () => {
    expect(getGradientFill("hsl(210 82% 36%)", 0.5)).toBe(
      "hsla(210, 82%, 36%, 0.5)",
    );
  });

  it("falls back to d3 for hex colors", () => {
    const out = getGradientFill("#336699", 0.4);
    expect(out).toMatch(/^hsla\(/);
    expect(out).toContain("0.4)");
  });
});

describe("validateJsonDataset", () => {
  it("rejects invalid JSON", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(validateJsonDataset("{")).toEqual({
      valid: false,
      reason: "Invalid JSON format",
    });
    log.mockRestore();
  });

  it("rejects non-array JSON", () => {
    expect(validateJsonDataset("{}")).toEqual({
      valid: false,
      reason: "JSON must be an array of objects",
    });
  });

  it("rejects empty array", () => {
    expect(validateJsonDataset("[]")).toEqual({
      valid: false,
      reason: "Array is empty",
    });
  });

  it("rejects non-plain-object items", () => {
    expect(validateJsonDataset("[1,2]")).toEqual({
      valid: false,
      reason: "Each item must be a plain object",
    });
  });

  it("rejects empty string keys on first row", () => {
    expect(validateJsonDataset('[{"": 1}]')).toEqual({
      valid: false,
      reason: "Object keys cannot be empty strings",
    });
  });

  it("accepts array of plain objects", () => {
    const input = '[{"a":1},{"a":2}]';
    const r = validateJsonDataset(input);
    expect(r.valid).toBe(true);
    expect(r.parsed).toEqual([{ a: 1 }, { a: 2 }]);
  });
});
