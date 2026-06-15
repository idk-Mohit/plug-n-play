import ChartPanel from "@/components/charts/ChartPanel";
import { EmptyDashboardSection } from "@/components/dashboard/EmptyDashboardSection";
import { useEffect, useState } from "react";
import type { AnyRecord } from "@/types/data.types";
import { ChartFullSettingsDrawer } from "@/components/charts/settings/ChartFullSettingDrawer";
import { DataTable } from "@/components/table/SimpleTable";
import { activeDatasetAtom } from "@/state/data/dataset";
import {
  DEFAULT_SAMPLE_POINT_COUNT,
  isDefaultSampleDatasetId,
} from "@/state/data/defaultSampleDataset";
import {
  activeDashboardIdAtom,
  persistedDashboardsAtom,
  resolveActiveDashboard,
} from "@/state/data/dashboard";
import type { DatasetRef } from "@/core/rpc/controllers/datasources";
import type { ChartType } from "@/enums/chart.enums";
import {
  tablePanelVizId,
  VIZ_CHART_CATALOG,
} from "@/state/data/dashboard-layout";
import { useAtomValue } from "jotai";
import { generateSeries } from "@/compute";
import { useDataSource } from "@/hooks/useDataSource";
import { useBlankDashboardChrome } from "@/hooks/useBlankDashboardChrome";

function HomeTableFromSource({
  panelId,
  uploadId,
}: {
  panelId: string;
  uploadId: string;
}) {
  const vizId = tablePanelVizId(panelId);
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

function HomeTablePanel({ panelId }: { panelId: string }) {
  const activeDataSet = useAtomValue(activeDatasetAtom);
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
    void generateSeries({ count: DEFAULT_SAMPLE_POINT_COUNT })
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
  }, [uploadId]);

  if (uploadId) {
    return <HomeTableFromSource panelId={panelId} uploadId={uploadId} />;
  }

  return (
    <DataTable
      key={panelId}
      loading={sampleTableLoading}
      data={sampleRows}
    />
  );
}

function chartPanelTitle(
  chartType: string | undefined,
  activeDataSet: DatasetRef | null,
): string {
  const typeLabel =
    VIZ_CHART_CATALOG.find((c) => c.type === chartType)?.label ?? "Chart";
  if (activeDataSet) {
    if (isDefaultSampleDatasetId(activeDataSet.id)) {
      return `${typeLabel} · Sample (${DEFAULT_SAMPLE_POINT_COUNT})`;
    }
    return `${typeLabel} · ${activeDataSet.name}`;
  }
  return `${typeLabel} · Sample (${DEFAULT_SAMPLE_POINT_COUNT})`;
}

const Home = () => {
  useBlankDashboardChrome();

  const dashboards = useAtomValue(persistedDashboardsAtom);
  const activeDashboardId = useAtomValue(activeDashboardIdAtom);
  const activeDashboard = resolveActiveDashboard(
    dashboards,
    activeDashboardId,
  );
  const panels = activeDashboard?.panels ?? [];
  const activeDataSet = useAtomValue(activeDatasetAtom);

  if (panels.length === 0) {
    return (
      <EmptyDashboardSection dashboardName={activeDashboard?.name} />
    );
  }

  const chartPanels = panels.filter((p) => p.type === "chart");

  return (
    <>
      <div className="flex flex-1 flex-wrap gap-4">
        {panels.map((panel) => {
          if (panel.type === "chart") {
            return (
              <ChartPanel
                key={panel.id}
                id={panel.id}
                chartType={panel.chartType as ChartType | undefined}
                title={chartPanelTitle(panel.chartType, activeDataSet)}
              />
            );
          }
          return <HomeTablePanel key={panel.id} panelId={panel.id} />;
        })}
      </div>
      {chartPanels.map((panel) => (
        <ChartFullSettingsDrawer key={panel.id} chartId={panel.id} />
      ))}
    </>
  );
};

export default Home;
