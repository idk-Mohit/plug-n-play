import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

/** Visible time window + pixel budget for aggregated chart queries. */
export type ChartViewport = {
  fromMs: number;
  toMs: number;
  buckets: number;
};

export const chartViewportAtomFamily = atomFamily((chartId: string) => {
  void chartId;
  return atom<ChartViewport | null>(null);
});

export type TableViewport = {
  offset: number;
  limit: number;
};

export const tableViewportAtomFamily = atomFamily((tableId: string) => {
  void tableId;
  return atom<TableViewport | null>(null);
});
