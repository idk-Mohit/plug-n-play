import { useEffect, useState } from "react";

import { getEngineRpc } from "@/core/rpc/engineSingleton";

/** Live row count from the engine (IDB-backed), when manifest `records` is missing. */
export function useDatasetLiveRowCount(datasetId: string | null) {
  const [rowCount, setRowCount] = useState<number | null>(null);

  useEffect(() => {
    if (!datasetId) {
      setRowCount(null);
      return;
    }
    let cancelled = false;
    void getEngineRpc()
      .call<{ rowCount: number }>("Data", "getMeta", [datasetId])
      .then((meta) => {
        if (!cancelled) setRowCount(meta.rowCount);
      })
      .catch(() => {
        if (!cancelled) setRowCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  return rowCount;
}
