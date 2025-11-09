import ChartPanel from "@/charts/ChartPanel";
import { useEffect, useMemo, useState } from "react";
import type { AnyRecord, timeseriesdata } from "@/types/data.types";
import { ChartFullSettingsDrawer } from "@/charts/settings/ChartFullSettingDrawer";
import { DataTable } from "@/components/table/SimpleTable";
import { activeDatasetAtom } from "@/atoms/dataset.atom";
import { useAtomValue } from "jotai";
import { dataEngine } from "@/core/data-engine";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const activeDataSet = useAtomValue(activeDatasetAtom);
  const [data, setData] = useState<timeseriesdata[]>([]);

  const worker = useMemo(
    () =>
      new Worker(new URL("@/worker/dataWorker.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  useEffect(() => {
    console.log("re-loading if active data set changes");
    if (!activeDataSet) {
      worker.postMessage({
        task: "generate_series",
        payload: { count: 100 },
      });

      worker.onmessage = (e) => {
        const { status, data } = e.data;
        if (status === "success") {
          setData(data);
        }
      };
    } else
      (async () => {
        const _data = await dataEngine.getDataset(activeDataSet.id ?? "");
        setData(Array.isArray(_data) ? _data : [_data]);
        if (_data) setLoading(false);
      })();
  }, [activeDataSet, worker]);

  return (
    <>
      <div className="flex flex-1 gap-4 flex-wrap">
        <ChartPanel data={data} id="chart-1" title="Chart 1" />
        <DataTable loading={loading} data={data as unknown as AnyRecord[]} />
      </div>
      <ChartFullSettingsDrawer id="chart-1" />
    </>
  );
};

export default Home;
