import { useAtom, useAtomValue } from "jotai";
import { chartSettingsAtomFamily } from "@/atoms/chart-setting";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BaseChart from "./BaseChart";
import type { timeseriesdata } from "@/types/data.types";
import { sidebarTransitionAtom } from "@/atoms/layout";
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
  }, [id, title]);

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
        <ChartQuickSettings id="chart-quick-settings" />
      </CardHeader>
      <Separator />
      <CardContent className="px-0 relative">
        <div
          data-transitioning={isTransitioning ? "true" : "false"}
          className="chart-transition-overlay flex gap-3 align-center justify-center"
        >
          <Loader key={Math.random()} type="random" size={56} />
        </div>
        <BaseChart
          id={id}
          data={data}
          type={chartSettings.type}
          gridType={chartSettings.grid}
        />
      </CardContent>
    </Card>
  );
}

export default ChartPanel;
