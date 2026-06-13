import type { FilterDefinition } from "@/core/rpc/data-contract";
import type { timeseriesdata } from "@/types/data.types";

function rowField(row: unknown, field: string): unknown {
  if (row === null || typeof row !== "object" || Array.isArray(row)) {
    return undefined;
  }
  return (row as Record<string, unknown>)[field];
}

function numericValue(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (v instanceof Date) return v.getTime();
  return null;
}

function xMsFromRow(row: unknown): number | null {
  const x = rowField(row, "x");
  if (x instanceof Date) return x.getTime();
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const t = Date.parse(x);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export function applyFiltersToRow(
  row: unknown,
  filters: FilterDefinition[] | undefined,
): boolean {
  if (!filters?.length) return true;

  for (const f of filters) {
    const raw = f.field === "x" ? xMsFromRow(row) : rowField(row, f.field);
    const val = f.field === "x" ? raw : raw;

    switch (f.op) {
      case "eq":
        if (val !== f.value) return false;
        break;
      case "contains":
        if (typeof val !== "string" || typeof f.value !== "string") return false;
        if (!val.toLowerCase().includes(f.value.toLowerCase())) return false;
        break;
      case "gt": {
        const n = numericValue(val);
        const target = numericValue(f.value);
        if (n === null || target === null || !(n > target)) return false;
        break;
      }
      case "lt": {
        const n = numericValue(val);
        const target = numericValue(f.value);
        if (n === null || target === null || !(n < target)) return false;
        break;
      }
      case "between": {
        const n = numericValue(val);
        const range = f.value as { from?: unknown; to?: unknown };
        const from = numericValue(range?.from);
        const to = numericValue(range?.to);
        if (n === null || from === null || to === null) return false;
        if (n < from || n > to) return false;
        break;
      }
      default:
        break;
    }
  }
  return true;
}

export function applyFiltersToTimeseries(
  rows: timeseriesdata[],
  filters: FilterDefinition[] | undefined,
): timeseriesdata[] {
  if (!filters?.length) return rows;
  return rows.filter((r) => applyFiltersToRow(r, filters));
}
