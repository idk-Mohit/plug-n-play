import type { timeseriesdata } from "@/types/data.types";

/**
 * Short fingerprint of the dataset for change detection in D3 paint effects.
 * Truncated to avoid huge strings when point counts grow.
 */
export function hashCartesianData(data: timeseriesdata[]): string {
  return JSON.stringify(data.map((d) => `${d.x}-${d.y}`)).slice(0, 500);
}
