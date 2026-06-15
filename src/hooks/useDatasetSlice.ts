import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import { getEngineRpc } from "@/core/rpc/engineSingleton";
import type {
  DataDatasetMeta,
  DataGetAggregatedResult,
} from "@/core/rpc/data-contract";
import { generateSeries } from "@/compute";
import { ChartType } from "@/enums/chart.enums";
import { activeDatasetAtom } from "@/state/data/dataset";
import { isDefaultSampleDatasetId } from "@/state/data/defaultSampleDataset";
import { vizFiltersAtomFamily } from "@/state/data/filters";
import { chartSettingsAtomFamily } from "@/state/ui/chart-setting";
import { chartViewportAtomFamily } from "@/state/ui/viewport";
import type { timeseriesdata } from "@/types/data.types";

function aggregateMethodForChartType(
  t: ChartType,
): "lttb" | "minMax" | "mean" {
  switch (t) {
    case ChartType.BAR:
      return "minMax";
    case ChartType.SCATTER:
      return "mean";
    default:
      return "lttb";
  }
}

const DEBOUNCE_MS = 80;

/**
 * Loads a downsampled window for the cartesian chart via engine worker + IndexedDB.
 * All charts share the dashboard dataset (`activeDatasetAtom`); each chartId gets its
 * own viewport and row filters so panels can show different slices of the same data.
 */
export function useDatasetSlice(chartId: string) {
  const active = useAtomValue(activeDatasetAtom);
  const filters = useAtomValue(vizFiltersAtomFamily(chartId));
  const chartType = useAtomValue(chartSettingsAtomFamily(chartId)).type;
  const [viewport, setViewport] = useAtom(chartViewportAtomFamily(chartId));
  const [data, setData] = useState<timeseriesdata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const datasetId = active?.id ?? null;

  useEffect(() => {
    setViewport(null);
  }, [datasetId, setViewport]);

  useEffect(() => {
    if (!datasetId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (isDefaultSampleDatasetId(datasetId)) {
      setLoading(true);
      let cancelled = false;
      void generateSeries({ count: 256 })
        .then(({ data: series }) => {
          if (cancelled) return;
          setData(series);
          setError(null);
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e instanceof Error ? e : new Error(String(e)));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      try {
        const rpc = getEngineRpc();
        const meta = await rpc.call<DataDatasetMeta>("Data", "getMeta", [
          datasetId,
        ]);
        if (cancelled) return;

        if (!meta.xRange) {
          setData([]);
          return;
        }
        const [x0, x1] = meta.xRange;
        let vp = viewport;
        if (!vp) {
          vp = {
            fromMs: x0,
            toMs: x1,
            buckets: 512,
          };
          setViewport(vp);
        }
        const method = aggregateMethodForChartType(chartType);
        const result = await rpc.call<DataGetAggregatedResult>(
          "Data",
          "getAggregated",
          [
            {
              datasetId,
              fromMs: vp.fromMs,
              toMs: vp.toMs,
              buckets: vp.buckets,
              method,
              filters,
            },
          ],
        );
        if (cancelled) return;
        setData(result.points);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void run();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [datasetId, chartType, viewport, setViewport, filters]);

  return { data, loading, error, viewport, setViewport };
}
