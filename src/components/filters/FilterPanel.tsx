import { useAtom } from "jotai";
import { IconFilter, IconPlus, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterDefinition, FilterOp } from "@/core/rpc/data-contract";
import { createFilter, globalFiltersAtom } from "@/state/data/filters";

const OPS: { value: FilterOp; label: string }[] = [
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "eq", label: "=" },
  { value: "contains", label: "contains" },
  { value: "between", label: "between" },
];

/**
 * Global filter editor (Phase 1d). Mount only where product UX calls for it —
 * not wired into Home by default until a focused UI pass lands.
 */
export function FilterPanel() {
  const [filters, setFilters] = useAtom(globalFiltersAtom);

  const addFilter = () => {
    setFilters([...filters, createFilter({ field: "y", op: "gt", value: 0 })]);
  };

  const updateFilter = (id: string, patch: Partial<FilterDefinition>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconFilter className="size-4" aria-hidden="true" />
          Data filters
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addFilter}>
          <IconPlus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>

      {filters.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No filters — charts use the full viewport window.
        </p>
      ) : (
        <ul className="space-y-2">
          {filters.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-2">
              <Input
                className="h-8 w-20"
                value={f.field}
                onChange={(e) =>
                  updateFilter(f.id, { field: e.target.value })
                }
                aria-label="Filter field"
              />
              <Select
                value={f.op}
                onValueChange={(v) =>
                  updateFilter(f.id, { op: v as FilterOp })
                }
              >
                <SelectTrigger className="h-8 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="h-8 w-24 tabular-nums"
                value={String(f.value ?? "")}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  updateFilter(f.id, {
                    value: Number.isFinite(n) ? n : e.target.value,
                  });
                }}
                aria-label="Filter value"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                aria-label="Remove filter"
                onClick={() => removeFilter(f.id)}
              >
                <IconX className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
