import { useAtom, useAtomValue } from "jotai";
import { chartSettingsAtomFamily } from "@/state/ui/chart-setting";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BaseChart from "@/d3-core/charts/cartesian/BaseChart";
import type { timeseriesdata } from "@/types/data.types";
import { sidebarTransitionAtom } from "@/state/ui/layout";
import { Loader } from "@/components/loader";
import { Separator } from "@/components/ui/separator";
import { ChartQuickSettings } from "./settings/QuickSetting";
import { useEffect } from "react";

interface ChartPanelProps {
  id: string;
  title: string;
  data: timeseriesdata[];
}

export function ChartPanel({ id, title, data }: ChartPanelProps) {
  const isTransitioning = useAtomValue(sidebarTransitionAtom);

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
        <BaseChart
          id={id}
          data={data}
          height={200}
          type={chartSettings.type}
          gridType={chartSettings.grid}
        />
      </CardContent>
    </Card>
  );
}

export default ChartPanel;
