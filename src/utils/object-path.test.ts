import { describe, expect, it } from "vitest";

import { getNested, setNested } from "./object-path";

describe("getNested", () => {
  it("returns undefined for nullish or non-object roots", () => {
    expect(getNested(null, "a")).toBeUndefined();
    expect(getNested(undefined, "a")).toBeUndefined();
    expect(getNested(1, "a")).toBeUndefined();
    expect(getNested("x", "a")).toBeUndefined();
  });

  it("reads dotted paths", () => {
    const obj = { animation: { duration: 120 } };
    expect(getNested(obj, "animation.duration")).toBe(120);
    expect(getNested(obj, "animation")).toEqual({ duration: 120 });
    expect(getNested(obj, "missing")).toBeUndefined();
    expect(getNested(obj, "animation.missing")).toBeUndefined();
  });
});

describe("setNested", () => {
  it("sets a shallow key immutably", () => {
    const a = { x: 1 };
    const b = setNested(a, "y", 2);
    expect(b).toEqual({ x: 1, y: 2 });
    expect(a).toEqual({ x: 1 });
  });

  it("creates and merges nested objects", () => {
    const a = { animation: { duration: 100 } };
    const b = setNested(a, "animation.easing", "linear");
    expect(b).toEqual({ animation: { duration: 100, easing: "linear" } });
    expect(a.animation).toEqual({ duration: 100 });
  });
});
