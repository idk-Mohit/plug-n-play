import { useAtom } from "jotai";
import {
  chartSettingsAtomFamily,
  chartFullSettingsDrawerAtom,
  type ChartSettings,
} from "@/state/ui/chart-setting";
import { FormWrapper } from "@/components/form-wrapper";
import { chartSettingsFormConfig } from "@/components/form-wrapper/configs/chart-settings.config";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ChartType as ChartTypeConst } from "@/enums/chart.enums";

interface ChartSettingsFormWrapperProps {
  chartId: string;
}

/**
 * Full chart settings drawer: config-driven sections with collapsible groups.
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

  const getFilteredSections = () => {
    return chartSettingsFormConfig
      .filter((section) => {
        if (
          section.id === "data-points" &&
          (chartSettings.type === ChartTypeConst.SCATTER ||
            chartSettings.type === ChartTypeConst.BAR)
        ) {
          return false;
        }
        return true;
      })
      .map((section) => {
        if (section.id === "animation") {
          if (!chartSettings.animation.enabled) {
            return {
              ...section,
              fields: section.fields.filter(
                (f) => f.name === "animation.enabled",
              ),
            };
          }
          return section;
        }

        if (section.id !== "advanced") return section;
        const hideCurve =
          chartSettings.type === ChartTypeConst.SCATTER ||
          chartSettings.type === ChartTypeConst.BAR;
        if (!hideCurve) return section;
        return {
          ...section,
          fields: section.fields.filter((f) => f.name !== "pathCurve"),
        };
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
        aria-hidden
      />
      <aside className="relative ml-auto flex h-full w-full max-w-[min(100vw,20rem)] flex-col border-l border-border bg-background shadow-lg">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Chart settings
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            onClick={closeDrawer}
            className="shrink-0"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <FormWrapper<ChartSettings>
            sections={getFilteredSections()}
            values={chartSettings}
            onUpdate={setChartSettings}
            title=""
            description=""
            showActions={false}
            className="space-y-0"
          />
        </div>
      </aside>
    </div>
  );
}
