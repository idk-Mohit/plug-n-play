import { useCallback, useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { DataSource } from "@/core/data-source/DataSource";
import type { DataSourcePolicy, GetRowResult } from "@/core/data-source/types";
import { getEngineRpc } from "@/core/rpc/engineSingleton";
import { dataSourceVersionAtomFamily } from "@/state/ui/viewport";
import type { AnyRecord } from "@/types/data.types";

type GetPageRpcResult = {
  rows: unknown[];
  total: number;
  offset: number;
  limit: number;
};

/**
 * Memory-bounded paged rows for tables (see docs/design/memory-bounded-data-source.md).
 */
export function useDataSource(
  vizId: string,
  args: { datasetId: string | null; policy?: DataSourcePolicy },
) {
  const { datasetId, policy } = args;
  const dsRef = useRef<DataSource<AnyRecord> | null>(null);
  const [loading, setLoading] = useState(() => !!args.datasetId);

  const versionAtom = dataSourceVersionAtomFamily(vizId);
  const revision = useAtomValue(versionAtom);
  const setVersion = useSetAtom(versionAtom);

  useEffect(() => {
    void setVersion(0);
    if (!datasetId) {
      dsRef.current?.dispose();
      dsRef.current = null;
      setLoading(false);
      return;
    }

    setLoading(true);
    const ds = new DataSource<AnyRecord>(vizId, policy, {
      fetchPage: async (offset, limit, signal) => {
        const r = await getEngineRpc().call<GetPageRpcResult>(
          "Data",
          "getPage",
          [{ datasetId, offset, limit }],
          { signal },
        );
        return {
          rows: r.rows,
          total: r.total,
          offset: r.offset,
          limit: r.limit,
        };
      },
      onChange: () => {
        void setVersion((v) => v + 1);
      },
    });
    dsRef.current = ds;
    void ds.ensurePage(0).finally(() => {
      setLoading(false);
    });

    return () => {
      ds.dispose();
      if (dsRef.current === ds) dsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    datasetId,
    vizId,
    policy?.bandPages,
    policy?.overscanPages,
    policy?.pageSize,
    setVersion,
  ]);

  const getRow = useCallback((i: number): GetRowResult<AnyRecord> => {
    const ds = dsRef.current;
    if (!ds) return { state: "pending" };
    return ds.getRow(i);
  }, []);

  const refresh = useCallback(() => {
    const ds = dsRef.current;
    if (!ds) return;
    setLoading(true);
    ds.reset();
    void ds.ensurePage(0).finally(() => {
      setLoading(false);
    });
  }, []);

  const total = dsRef.current?.total ?? 0;

  return { getRow, total, loading, refresh, revision };
}
