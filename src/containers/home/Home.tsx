import ChartPanel from "@/components/charts/ChartPanel";
import { useEffect, useState } from "react";
import type { AnyRecord, timeseriesdata } from "@/types/data.types";
import { ChartFullSettingsDrawer } from "@/components/charts/settings/ChartFullSettingDrawer";
import { DataTable } from "@/components/table/SimpleTable";
import { activeDatasetAtom } from "@/state/data/dataset";
import {
  DEFAULT_SAMPLE_POINT_COUNT,
  isDefaultSampleDatasetId,
} from "@/state/data/defaultSampleDataset";
import { useAtomValue } from "jotai";
import { dataEngine } from "@/core/data-engine";
import { generateSeries } from "@/compute";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const activeDataSet = useAtomValue(activeDatasetAtom);
  const [data, setData] = useState<timeseriesdata[]>([]);
  const dataCount = DEFAULT_SAMPLE_POINT_COUNT;

  useEffect(() => {
    const id = activeDataSet?.id;
    const useUploaded =
      id && !isDefaultSampleDatasetId(id);

    if (useUploaded) {
      void (async () => {
        try {
          const _data = await dataEngine.getDataset(id);
          const formattedData = Array.isArray(_data) ? _data : [_data];
          setData(formattedData as timeseriesdata[]);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error(error);
        }
      })();
      return;
    }

    let cancelled = false;
    setLoading(true);
    void generateSeries({ count: dataCount })
      .then(({ data: series }) => {
        if (!cancelled) {
          setData(series);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoading(false);
          console.error(error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeDataSet, dataCount]);

  return (
    <>
      <div className="flex flex-1 gap-4 flex-wrap">
        <ChartPanel
          data={data}
          id="chart-1"
          title={
            activeDataSet
              ? isDefaultSampleDatasetId(activeDataSet.id)
                ? `Sample time series (${dataCount})`
                : `Dataset: ${activeDataSet.name}`
              : `Sample time series (${dataCount})`
          }
        />
        <DataTable loading={loading} data={data as unknown as AnyRecord[]} />
      </div>
      <ChartFullSettingsDrawer chartId="chart-1" />
    </>
  );
};

export default Home;
