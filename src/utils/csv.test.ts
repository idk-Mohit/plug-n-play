import { describe, expect, it } from "vitest";

import { parseCsvToRecords } from "./csv";

describe("parseCsvToRecords", () => {
  it("returns empty array when fewer than header + 1 row", () => {
    expect(parseCsvToRecords("")).toEqual([]);
    expect(parseCsvToRecords("only_header")).toEqual([]);
    expect(parseCsvToRecords("a,b\n")).toEqual([]);
  });

  it("maps header to row objects and trims cells", () => {
    const rows = parseCsvToRecords("name,score\n  Alice , 10 \nBob,20");
    expect(rows).toEqual([
      { name: "Alice", score: "10" },
      { name: "Bob", score: "20" },
    ]);
  });

  it("handles CRLF line endings", () => {
    const rows = parseCsvToRecords("x,y\r\n1,2\r\n3,4");
    expect(rows).toEqual([
      { x: "1", y: "2" },
      { x: "3", y: "4" },
    ]);
  });

  it("strips surrounding quotes on cells (no RFC quoted commas)", () => {
    // Minimal parser splits on commas only; commas inside quotes are not preserved.
    const rows = parseCsvToRecords('id,val\n1,"hello"');
    expect(rows).toEqual([{ id: "1", val: "hello" }]);
  });

  it("pads missing trailing cells with empty string", () => {
    const rows = parseCsvToRecords("a,b,c\n1,2");
    expect(rows).toEqual([{ a: "1", b: "2", c: "" }]);
  });
});
