import type { DataQueryRequest } from "@/core/rpc/data-contract";

export type ExecutionPlan =
  | { route: "Data.getMeta"; args: [string] }
  | {
      route: "Data.getPage";
      args: [
        {
          datasetId: string;
          offset: number;
          limit: number;
          filters?: DataQueryRequest["filters"];
        },
      ];
    }
  | {
      route: "Data.getRange";
      args: [
        {
          datasetId: string;
          fromMs: number;
          toMs: number;
          order?: "asc" | "desc";
          limit?: number;
          filters?: DataQueryRequest["filters"];
        },
      ];
    }
  | {
      route: "Data.getAggregated";
      args: [
        {
          datasetId: string;
          fromMs: number;
          toMs: number;
          buckets: number;
          method: "lttb" | "minMax" | "mean";
          filters?: DataQueryRequest["filters"];
        },
      ];
    };

/**
 * Thin query planner — routes by intent without a full cost optimizer.
 */
export function planQuery(request: DataQueryRequest): ExecutionPlan {
  switch (request.intent) {
    case "meta":
      return { route: "Data.getMeta", args: [request.datasetId] };
    case "page": {
      const page = request.page ?? { offset: 0, limit: 50 };
      return {
        route: "Data.getPage",
        args: [
          {
            datasetId: request.datasetId,
            offset: page.offset,
            limit: page.limit,
            filters: request.filters,
          },
        ],
      };
    }
    case "range": {
      const range = request.range ?? {
        fromMs: 0,
        toMs: Date.now(),
      };
      return {
        route: "Data.getRange",
        args: [
          {
            datasetId: request.datasetId,
            fromMs: range.fromMs,
            toMs: range.toMs,
            order: range.order,
            limit: range.limit,
            filters: request.filters,
          },
        ],
      };
    }
    case "aggregated": {
      const agg = request.aggregated ?? {
        fromMs: 0,
        toMs: Date.now(),
        buckets: 512,
        method: "lttb" as const,
      };
      return {
        route: "Data.getAggregated",
        args: [
          {
            datasetId: request.datasetId,
            fromMs: agg.fromMs,
            toMs: agg.toMs,
            buckets: agg.buckets,
            method: agg.method,
            filters: request.filters,
          },
        ],
      };
    }
    default:
      return { route: "Data.getMeta", args: [request.datasetId] };
  }
}
