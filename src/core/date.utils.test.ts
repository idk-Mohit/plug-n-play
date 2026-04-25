import { describe, expect, it } from "vitest";

import { safeFormatDate, toSafeDate } from "./date.utils";

describe("toSafeDate", () => {
  it("returns null for nullish and invalid", () => {
    expect(toSafeDate(null)).toBeNull();
    expect(toSafeDate(undefined)).toBeNull();
    expect(toSafeDate("")).toBeNull();
    expect(toSafeDate(new Date("invalid"))).toBeNull();
  });

  it("accepts valid Date instances", () => {
    const d = new Date("2024-06-15T12:00:00.000Z");
    expect(toSafeDate(d)?.getTime()).toBe(d.getTime());
  });

  it("treats small numbers as unix seconds", () => {
    const d = toSafeDate(1_700_000_000);
    expect(d).not.toBeNull();
    expect(d!.getTime()).toBe(1_700_000_000 * 1000);
  });

  it("treats large numbers as milliseconds", () => {
    const ms = 1_700_000_000_123;
    const d = toSafeDate(ms);
    expect(d?.getTime()).toBe(ms);
  });

  it("parses /Date(ms)/ strings", () => {
    const d = toSafeDate("/Date(1700000000000)/");
    expect(d?.getTime()).toBe(1_700_000_000_000);
  });

  it("parses digit-only unix strings", () => {
    expect(toSafeDate("1700000000")?.getTime()).toBe(1_700_000_000 * 1000);
    expect(toSafeDate("1700000000123")?.getTime()).toBe(1_700_000_000_123);
  });

  it("parses ISO strings with Z", () => {
    const d = toSafeDate("2024-01-15T10:30:00.000Z");
    expect(d).not.toBeNull();
    expect(d!.toISOString()).toBe("2024-01-15T10:30:00.000Z");
  });
});

describe("safeFormatDate", () => {
  it("returns em dash for invalid input", () => {
    expect(safeFormatDate(null)).toBe("—");
    expect(safeFormatDate("not a date")).toBe("—");
  });

  it("returns a non-empty display string for valid input", () => {
    const s = safeFormatDate("2024-03-20T15:00:00.000Z");
    expect(s).not.toBe("—");
    expect(s.length).toBeGreaterThan(4);
  });
});
