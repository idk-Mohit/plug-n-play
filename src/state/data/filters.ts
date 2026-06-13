import { atom } from "jotai";

import type { FilterDefinition } from "@/core/rpc/data-contract";

/** Active filters applied to chart and table queries (Phase 1d). */
export const globalFiltersAtom = atom<FilterDefinition[]>([]);

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
