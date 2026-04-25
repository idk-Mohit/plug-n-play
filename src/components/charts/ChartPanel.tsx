import { useAtom, useAtomValue } from "jotai";
import { chartSettingsAtomFamily } from "@/state/ui/chart-setting";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CartesianChart from "@/d3-core/charts/cartesian/CartesianChart";
import { sidebarTransitionAtom } from "@/state/ui/layout";
import { Loader } from "@/components/loader";
import { Separator } from "@/components/ui/separator";
import { ChartQuickSettings } from "./settings/QuickSetting";
import { useEffect } from "react";
import { useDatasetSlice } from "@/hooks/useDatasetSlice";
import { activeDatasetAtom } from "@/state/data/dataset";
import { isDefaultSampleDatasetId } from "@/state/data/defaultSampleDataset";

interface ChartPanelProps {
  id: string;
  title: string;
}

export function ChartPanel({ id, title }: ChartPanelProps) {
  const isTransitioning = useAtomValue(sidebarTransitionAtom);
  const active = useAtomValue(activeDatasetAtom);
  const canViewportInteract = !!(
    active && !isDefaultSampleDatasetId(active.id)
  );

  const { data, loading: dataLoading } = useDatasetSlice(id);

  const [chartSettings, setChartSettings] = useAtom(
    chartSettingsAtomFamily(id)
  );

  useEffect(() => {
    setChartSettings((prev) => ({ ...prev, title, id }));
  }, [id, title, setChartSettings]);

  return (
    <Card className="@container/card p-4 lg:px-6 w-[100%] relative gap-1.5">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-1 py-1">
        <div className="">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {chartSettings.title ?? (title || "Untitled Chart")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.length} data points • Type: {chartSettings.type}
          </p>
        </div>
        <ChartQuickSettings chartId={id} />
      </CardHeader>
      <Separator />
      <CardContent className="px-0 relative">
        {isTransitioning ? (
          <div
            data-transitioning="true"
            className="chart-transition-overlay flex gap-3 align-center justify-center"
          >
            <Loader key="chart-sidebar-transition" type="random" size={56} />
          </div>
        ) : null}
        {dataLoading && data.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader type="random" size={48} />
          </div>
        ) : (
          <CartesianChart
            id={id}
            data={data}
            height={200}
            type={chartSettings.type}
            gridType={chartSettings.grid}
            interactionEnabled={canViewportInteract}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default ChartPanel;
