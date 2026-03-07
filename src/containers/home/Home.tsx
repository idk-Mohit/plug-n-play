import ChartPanel from "@/components/charts/ChartPanel";
import { useEffect, useState } from "react";
import type { AnyRecord, timeseriesdata } from "@/types/data.types";
import { ChartFullSettingsDrawer } from "@/components/charts/settings/ChartFullSettingDrawer";
import { DataTable } from "@/components/table/SimpleTable";
import { activeDatasetAtom } from "@/state/data/dataset";
import { useAtomValue } from "jotai";
import { dataEngine } from "@/core/data-engine";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const activeDataSet = useAtomValue(activeDatasetAtom);
  const [data, setData] = useState<timeseriesdata[]>([]);

  // Generate default data using worker when no dataset is active
  const generateDefaultData = async () => {
    setLoading(true);
    
    try {
      const worker = new Worker(
        new URL("@/compute/workers/dataWorker.ts", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (e) => {
        if (e.data.status === "working") {
          // Working status
        } else if (e.data.status === "success") {
          // The worker now returns properly formatted timeseriesdata
          const formattedData: timeseriesdata[] = e.data.data;
          setData(formattedData);
          setLoading(false);
          worker.terminate();
        } else if (e.data.status === "error") {
          setLoading(false);
          worker.terminate();
        }
      };

      worker.onerror = (_error) => {
        // Handle worker error silently
        setLoading(false);
        worker.terminate();
      };

      // Send the request immediately after creating the worker
      worker.postMessage({ task: "generate_series", payload: { count: 10000 } });

    } catch (_error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDataSet) {
      // Load actual dataset
      (async () => {
        try {
          const _data = await dataEngine.getDataset(activeDataSet.id ?? "");
          const formattedData = Array.isArray(_data) ? _data : [_data];
          setData(formattedData);
          setLoading(false);
        } catch (_error) {
          setLoading(false);
        }
      })();
    } else {
      // Generate default data using worker
      generateDefaultData();
    }
  }, [activeDataSet]);

  return (
    <>
      <div className="flex flex-1 gap-4 flex-wrap">
        <ChartPanel 
          data={data} 
          id="chart-1" 
          title={activeDataSet ? `Dataset: ${activeDataSet.name}` : "Default Sample Data (100 points)"} 
        />
        <DataTable loading={loading} data={data as unknown as AnyRecord[]} />
      </div>
      <ChartFullSettingsDrawer chartId="chart-1" />
    </>
  );
};

export default Home;
