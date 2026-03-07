// Compute layer types

export interface ComputeRequest {
  type: 'process-data' | 'calculate-stats' | 'transform-dataset';
  payload: unknown;
}

export interface ComputeResponse {
  type: 'success' | 'error';
  result?: unknown;
  error?: string;
}

export interface DataProcessor {
  aggregate(data: Dataset[], operation: AggregationOp): Promise<Dataset>;
  filter(data: Dataset, criteria: FilterCriteria): Promise<Dataset>;
  sort(data: Dataset, comparator: SortComparator): Promise<Dataset>;
}

// Type definitions will be expanded as we implement features
export interface Dataset {
  id: string;
  name: string;
  data: unknown[];
  metadata: Record<string, unknown>;
}

export type AggregationOp = 'sum' | 'avg' | 'count' | 'min' | 'max';
export interface FilterCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains';
  value: unknown;
}
export type SortComparator = (a: unknown, b: unknown) => number;
