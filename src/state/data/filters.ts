import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

import type { FilterDefinition } from "@/core/rpc/data-contract";

/**
 * Optional dashboard-wide filters (apply to every viz on the dashboard).
 * Reserved for a future dashboard slice — not wired into query hooks yet.
 */
export const globalFiltersAtom = atom<FilterDefinition[]>([]);

/**
 * Per-visualization row filters. Each chart/table on a dashboard reads the same
 * dataset (`activeDatasetAtom`) but can slice it independently via its own filters.
 *
 * @param vizId - Must match the chart panel `id` or table `useDataSource` viz id.
 */
export const vizFiltersAtomFamily = atomFamily((vizId: string) => {
  void vizId;
  return atom<FilterDefinition[]>([]);
});

/** Builds a {@link FilterDefinition} with defaults (`y`, `gt`, `0`) and a new id. */
export function createFilter(
  partial?: Partial<FilterDefinition>,
): FilterDefinition {
  return {
    id: crypto.randomUUID(),
    field: partial?.field ?? "y",
    op: partial?.op ?? "gt",
    value: partial?.value ?? 0,
  };
}
