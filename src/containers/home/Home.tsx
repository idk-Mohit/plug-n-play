import ChartPanel from "@/charts/ChartPanel";
import { useEffect, useMemo, useState } from "react";
import { ResourceStatsPanel } from "../analytics/Resources";
import { SectionCards } from "@/components/card/SectionCard";
import type { timeseriesdata } from "@/types/data.types";
import { ChartFullSettingsDrawer } from "@/charts/settings/ChartFullSettingDrawer";

const Home = () => {
  const [data, setData] = useState<timeseriesdata[]>([]);

  const worker = useMemo(
    () =>
      new Worker(new URL("@/worker/dataWorker.ts", import.meta.url), {
        type: "module",
      }),
    []
  );
  useEffect(() => {
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
  }, [worker]);

  return (
    <>
      <div className="flex flex-1 gap-4 flex-wrap">
        <ChartPanel data={data} id="chart-1" title="Chart 1" />
        <ResourceStatsPanel />
      </div>
      <SectionCards />

      <ChartFullSettingsDrawer id="chart-1" />
    </>
  );
};

export default Home;
