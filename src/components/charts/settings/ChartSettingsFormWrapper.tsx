import { useAtom } from "jotai";
import {
  chartSettingsAtomFamily,
  chartFullSettingsDrawerAtom,
  type ChartSettings,
} from "@/state/ui/chart-setting";
import { FormWrapper } from "@/components/form-wrapper";
import { chartSettingsFormConfig } from "@/components/form-wrapper/configs/chart-settings.config";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SlidersHorizontal, X } from "lucide-react";
import { ChartType as ChartTypeConst } from "@/enums/chart.enums";

interface ChartSettingsFormWrapperProps {
  chartId: string;
}

/**
 * Full chart settings drawer: compact GitBook-style panel (icons, sections, scroll).
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
        className="fixed inset-0 bg-black/60 transition-opacity duration-300 ease-in-out"
        onClick={closeDrawer}
        aria-hidden
      />
      <aside className="relative ml-auto flex h-full w-full max-w-[min(100vw,19rem)] flex-col border-l border-border/80 bg-background/95 shadow-2xl backdrop-blur-sm supports-[backdrop-filter]:bg-background/90">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-border/70 px-3 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold leading-tight tracking-tight text-foreground">
              Chart settings
            </h2>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Appearance & behavior
            </p>
          </div>
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

        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="p-3 pb-4">
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
          </ScrollArea>
        </div>
      </aside>
    </div>
  );
}
