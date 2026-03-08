/**
 * Chart Quick Settings
 *
 * Component for displaying quick chart configuration options
 * in a compact interface.
 */

import { useAtom } from "jotai";
import {
  chartSettingsAtomFamily,
  chartFullSettingsDrawerAtom,
  type GridType,
} from "@/state/ui/chart-setting";
import { GridType as GridTypeConst } from "@/enums/chart.enums";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface ChartQuickSettingsProps {
  chartId: string;
}

export function ChartQuickSettings({ chartId }: ChartQuickSettingsProps) {
  const [chartSettings, setChartSettings] = useAtom(
    chartSettingsAtomFamily(chartId),
  );
  const [, setDrawerState] = useAtom(chartFullSettingsDrawerAtom);

  const openFullSettings = () => {
    setDrawerState({ enabled: true, chartId });
  };

  const toggleGrid = () => {
    const gridOptions: GridType[] = [
      GridTypeConst.NONE,
      GridTypeConst.HORIZONTAL,
      GridTypeConst.VERTICAL,
      GridTypeConst.BOTH,
    ];
    const currentIndex = gridOptions.indexOf(chartSettings.grid);
    const nextIndex = (currentIndex + 1) % gridOptions.length;
    setChartSettings({ ...chartSettings, grid: gridOptions[nextIndex] });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleGrid}
        className="text-xs"
      >
        Grid: {chartSettings.grid}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={openFullSettings}
        className="text-xs"
      >
        <Settings className="w-3 h-3" />
      </Button>
    </div>
  );
}
