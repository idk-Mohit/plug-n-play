import { useCallback, useEffect, useState } from "react";

import { getEngineRpc } from "@/core/rpc/engineSingleton";
import type { AnyRecord } from "@/types/data.types";

export type DatasetPageResult = {
  rows: unknown[];
  total: number;
  offset: number;
  limit: number;
};

/**
 * Offset-based pages from `Data.getPage` (worker + IndexedDB).
 */
export function useDatasetPage(datasetId: string | null, pageSize: number) {
  const [rows, setRows] = useState<AnyRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!datasetId) {
      setRows([]);
      setTotal(0);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getEngineRpc()
      .call<DatasetPageResult>("Data", "getPage", [
        { datasetId, offset: 0, limit: pageSize },
      ])
      .then((r) => {
        if (cancelled) return;
        setRows(r.rows as AnyRecord[]);
        setTotal(r.total);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId, pageSize]);

  const loadMore = useCallback(() => {
    if (!datasetId || rows.length >= total) return Promise.resolve();
    return getEngineRpc()
      .call<DatasetPageResult>("Data", "getPage", [
        { datasetId, offset: rows.length, limit: pageSize },
      ])
      .then((r) => {
        setRows((prev) => [...prev, ...(r.rows as AnyRecord[])]);
      });
  }, [datasetId, pageSize, rows.length, total]);

  const reset = useCallback(() => {
    if (!datasetId) return;
    setLoading(true);
    void getEngineRpc()
      .call<DatasetPageResult>("Data", "getPage", [
        { datasetId, offset: 0, limit: pageSize },
      ])
      .then((r) => {
        setRows(r.rows as AnyRecord[]);
        setTotal(r.total);
      })
      .finally(() => setLoading(false));
  }, [datasetId, pageSize]);

  return { rows, total, loading, loadMore, reset };
}
