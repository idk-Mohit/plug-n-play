import ChartPanel from "@/components/charts/ChartPanel";
import { useEffect, useState } from "react";
import type { AnyRecord } from "@/types/data.types";
import { ChartFullSettingsDrawer } from "@/components/charts/settings/ChartFullSettingDrawer";
import { DataTable } from "@/components/table/SimpleTable";
import { activeDatasetAtom } from "@/state/data/dataset";
import {
  DEFAULT_SAMPLE_POINT_COUNT,
  isDefaultSampleDatasetId,
} from "@/state/data/defaultSampleDataset";
import { useAtomValue } from "jotai";
import { generateSeries } from "@/compute";
import { useDataSource } from "@/hooks/useDataSource";

function HomeTableFromSource({ uploadId }: { uploadId: string }) {
  const vizId = `home-table:${uploadId}`;
  const { getRow, total, loading, revision } = useDataSource(vizId, {
    datasetId: uploadId,
    policy: { pageSize: 50, bandPages: 10 },
  });
  return (
    <DataTable
      key={vizId}
      loading={loading}
      dataSource={{ getRow, total, revision }}
    />
  );
}

const Home = () => {
  const activeDataSet = useAtomValue(activeDatasetAtom);
  const dataCount = DEFAULT_SAMPLE_POINT_COUNT;

  const uploadId =
    activeDataSet && !isDefaultSampleDatasetId(activeDataSet.id)
      ? activeDataSet.id
      : null;

  const [sampleRows, setSampleRows] = useState<AnyRecord[]>([]);
  const [sampleTableLoading, setSampleTableLoading] = useState(false);

  useEffect(() => {
    if (uploadId) return;
    let cancelled = false;
    setSampleTableLoading(true);
    void generateSeries({ count: dataCount })
      .then(({ data: series }) => {
        if (!cancelled) {
          setSampleRows(series.slice(0, 50) as unknown as AnyRecord[]);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setSampleTableLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uploadId, dataCount]);

  return (
    <>
      <div className="flex flex-1 gap-4 flex-wrap">
        <ChartPanel
          id="chart-1"
          title={
            activeDataSet
              ? isDefaultSampleDatasetId(activeDataSet.id)
                ? `Sample time series (${dataCount})`
                : `Dataset: ${activeDataSet.name}`
              : `Sample time series (${dataCount})`
          }
        />
        {uploadId ? (
          <HomeTableFromSource uploadId={uploadId} />
        ) : (
          <DataTable loading={sampleTableLoading} data={sampleRows} />
        )}
      </div>
      <ChartFullSettingsDrawer chartId="chart-1" />
    </>
  );
};

export default Home;
