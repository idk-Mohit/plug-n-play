/**
 * Chart Quick Settings
 * 
 * Component for displaying quick chart configuration options
 * in a compact interface.
 */

import { useAtom } from "jotai";
import {
  type GridType,
  chartSettingsAtomFamily,
  chartFullSettingsDrawerAtom,
} from "@/state/ui/chart-setting";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface ChartQuickSettingsProps {
  chartId: string;
}

export function ChartQuickSettings({ chartId }: ChartQuickSettingsProps) {
  const [chartSettings, setChartSettings] = useAtom(chartSettingsAtomFamily(chartId));
  const [, setDrawerState] = useAtom(chartFullSettingsDrawerAtom);

  const openFullSettings = () => {
    setDrawerState({ enabled: true, chartId });
  };

  const toggleGrid = () => {
    const gridOptions: GridType[] = ["none", "horizontal", "vertical", "both"];
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
