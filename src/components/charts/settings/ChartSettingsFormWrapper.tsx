import { useAtom } from "jotai";
import {
  chartSettingsAtomFamily,
  chartFullSettingsDrawerAtom,
} from "@/state/ui/chart-setting";
import { FormWrapper } from "@/components/form-wrapper";
import { chartSettingsFormConfig } from "@/components/form-wrapper/configs/chart-settings.config";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ChartSettingsFormWrapperProps {
  chartId: string;
}

/**
 * Chart settings drawer implemented using FormWrapper
 * This demonstrates how the FormWrapper can replace manual form implementations
 */
export function ChartSettingsFormWrapper({
  chartId,
}: ChartSettingsFormWrapperProps) {
  const [chartSettings, setChartSettings] = useAtom(
    chartSettingsAtomFamily(chartId),
  );
  const [drawerState, setDrawerState] = useAtom(chartFullSettingsDrawerAtom);

  const closeDrawer = () => {
    setDrawerState({ enabled: false, chartId: "" });
  };

  // Filter sections based on chart type
  const getFilteredSections = () => {
    return chartSettingsFormConfig.filter((section) => {
      // Hide data points section for scatter charts
      if (section.id === "data-points" && chartSettings.type === "scatter") {
        return false;
      }
      return true;
    });
  };

  if (!drawerState.enabled || drawerState.chartId !== chartId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
        onClick={closeDrawer}
      />
      <div className="relative ml-auto h-full w-80 bg-background border-l border-border p-6 shadow-lg overflow-y-auto transform transition-transform duration-500 ease-in-out translate-x-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Chart Settings
          </h2>
          <Button variant="ghost" size="sm" onClick={closeDrawer}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <FormWrapper
          sections={getFilteredSections()}
          values={chartSettings}
          onUpdate={setChartSettings}
          title=""
          description=""
          showActions={false} // Settings update in real-time
          className="space-y-6"
        />
      </div>
    </div>
  );
}
