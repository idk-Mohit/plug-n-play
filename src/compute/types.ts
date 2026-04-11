// Compute-layer types (future: aggregation, transforms). Keep minimal to avoid drift from app types.

export interface ComputeRequest {
  type: "process-data" | "calculate-stats" | "transform-dataset";
  payload: unknown;
}

export interface ComputeResponse {
  type: "success" | "error";
  result?: unknown;
  error?: string;
}

export interface DataProcessor {
  aggregate(data: unknown[], operation: AggregationOp): Promise<unknown>;
  filter(data: unknown[], criteria: FilterCriteria): Promise<unknown[]>;
  sort(data: unknown[], comparator: SortComparator): Promise<unknown[]>;
}

export type AggregationOp = "sum" | "avg" | "count" | "min" | "max";

export interface FilterCriteria {
  field: string;
  operator: "eq" | "ne" | "gt" | "lt" | "contains";
  value: unknown;
}

export type SortComparator = (a: unknown, b: unknown) => number;
