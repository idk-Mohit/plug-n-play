/**
 * Chart Full Settings Drawer
 *
 * Component for displaying comprehensive chart configuration options
 * in a drawer/sidebar interface.
 */

import { useAtom } from "jotai";
import {
  chartSettingsAtomFamily,
  chartFullSettingsDrawerAtom,
  type ChartType,
  type GridType,
  type PathCurveType,
  type AnimationType,
  type InteractionMode,
  type TimeFormat,
} from "@/state/ui/chart-setting";
import {
  ChartType as ChartTypeConst,
  GridType as GridTypeConst,
  PathCurveType as PathCurveTypeConst,
  AnimationType as AnimationTypeConst,
  InteractionMode as InteractionModeConst,
  TimeFormat as TimeFormatConst,
} from "@/enums/chart.enums";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface ChartFullSettingsDrawerProps {
  chartId: string;
}

export function ChartFullSettingsDrawer({
  chartId,
}: ChartFullSettingsDrawerProps) {
  const [chartSettings, setChartSettings] = useAtom(
    chartSettingsAtomFamily(chartId),
  );
  const [drawerState, setDrawerState] = useAtom(chartFullSettingsDrawerAtom);

  const closeDrawer = () => {
    setDrawerState({ enabled: false, chartId: "" });
  };

  const updateSetting = <K extends keyof typeof chartSettings>(
    key: K,
    value: (typeof chartSettings)[K],
  ) => {
    setChartSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateAnimationSetting = (
    enabled: boolean,
    type: AnimationType,
    duration?: number,
  ) => {
    updateSetting("animation", { enabled, type, duration });
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

        <div className="space-y-6">
          {/* Chart Type */}
          <div>
            <Label htmlFor="chart-type">Chart Type</Label>
            <Select
              value={chartSettings.type}
              onValueChange={(value: ChartType) => updateSetting("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ChartTypeConst.LINE}>Line</SelectItem>
                <SelectItem value={ChartTypeConst.AREA}>Area</SelectItem>
                <SelectItem value={ChartTypeConst.SCATTER}>Scatter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Grid Settings */}
          <div>
            <Label htmlFor="grid-type">Grid Type</Label>
            <Select
              value={chartSettings.grid}
              onValueChange={(value: GridType) => updateSetting("grid", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grid type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GridTypeConst.NONE}>None</SelectItem>
                <SelectItem value={GridTypeConst.HORIZONTAL}>
                  Horizontal
                </SelectItem>
                <SelectItem value={GridTypeConst.VERTICAL}>Vertical</SelectItem>
                <SelectItem value={GridTypeConst.BOTH}>Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Show Axes */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-axes">Show Axes</Label>
              <Switch
                id="show-axes"
                checked={chartSettings.showAxes}
                onCheckedChange={(checked) =>
                  updateSetting("showAxes", checked)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div>
            <Label htmlFor="stroke-color">Stroke Color</Label>
            <Input
              id="stroke-color"
              type="color"
              value={chartSettings.stroke}
              onChange={(e) => updateSetting("stroke", e.target.value)}
              className="w-full h-10"
            />
          </div>

          <Separator />

          {/* Stroke Width */}
          <div>
            <Label htmlFor="stroke-width">
              Stroke Width: {chartSettings.strokeWidth}px
            </Label>
            <Slider
              id="stroke-width"
              min={1}
              max={10}
              step={0.5}
              value={[chartSettings.strokeWidth]}
              onValueChange={([value]) => updateSetting("strokeWidth", value)}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Show Data Points */}
          {chartSettings.type !== ChartTypeConst.SCATTER && (
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-data-points">Show Data Points</Label>
                <Switch
                  id="show-data-points"
                  checked={chartSettings.showDataPoints}
                  onCheckedChange={(checked) =>
                    updateSetting("showDataPoints", checked)
                  }
                />
              </div>
            </div>
          )}

          {chartSettings.type !== ChartTypeConst.SCATTER && <Separator />}

          {/* Font Size */}
          <div>
            <Label htmlFor="font-size">
              Font Size: {chartSettings.fontSize}px
            </Label>
            <Slider
              id="font-size"
              min={8}
              max={20}
              step={1}
              value={[chartSettings.fontSize]}
              onValueChange={([value]) => updateSetting("fontSize", value)}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Animation */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="animation">Enable Animation</Label>
              <Switch
                id="animation"
                checked={chartSettings.animation.enabled}
                onCheckedChange={(checked) =>
                  updateAnimationSetting(
                    checked,
                    chartSettings.animation.type,
                    chartSettings.animation.duration,
                  )
                }
              />
            </div>

            {chartSettings.animation.enabled && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="animation-type">Animation Type</Label>
                  <Select
                    value={chartSettings.animation.type}
                    onValueChange={(value: AnimationType) =>
                      updateAnimationSetting(
                        true,
                        value,
                        chartSettings.animation.duration,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select animation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AnimationTypeConst.FADE}>
                        Fade
                      </SelectItem>
                      <SelectItem value={AnimationTypeConst.DRAW}>
                        Draw
                      </SelectItem>
                      <SelectItem value={AnimationTypeConst.GROW}>
                        Grow
                      </SelectItem>
                      <SelectItem value={AnimationTypeConst.NONE}>
                        None
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="animation-duration">
                    Duration: {chartSettings.animation.duration}ms
                  </Label>
                  <Slider
                    id="animation-duration"
                    min={100}
                    max={2000}
                    step={100}
                    value={[chartSettings.animation.duration || 800]}
                    onValueChange={([value]) =>
                      updateAnimationSetting(
                        true,
                        chartSettings.animation.type,
                        value,
                      )
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Curve Type */}
          <div>
            <Label htmlFor="curve-type">Curve Type</Label>
            <Select
              value={chartSettings.pathCurve}
              onValueChange={(value: PathCurveType) =>
                updateSetting("pathCurve", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select curve type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PathCurveTypeConst.LINEAR}>
                  Linear
                </SelectItem>
                <SelectItem value={PathCurveTypeConst.NATURAL}>
                  Natural
                </SelectItem>
                <SelectItem value={PathCurveTypeConst.BASIS}>Basis</SelectItem>
                <SelectItem value={PathCurveTypeConst.CARDINAL}>
                  Cardinal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Time Format */}
          <div>
            <Label htmlFor="time-format">Time Format</Label>
            <Select
              value={chartSettings.timeFormat}
              onValueChange={(value: TimeFormat) =>
                updateSetting("timeFormat", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TimeFormatConst.AUTO}>Auto</SelectItem>
                <SelectItem value={TimeFormatConst.HH_MM}>HH:mm</SelectItem>
                <SelectItem value={TimeFormatConst.HH_MM_A}>hh:mm a</SelectItem>
                <SelectItem value={TimeFormatConst.MM_DD}>MM/DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Interactions */}
          <div>
            <Label htmlFor="interaction">Interaction Mode</Label>
            <Select
              value={chartSettings.interaction}
              onValueChange={(value: InteractionMode) =>
                updateSetting("interaction", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interaction mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InteractionModeConst.NONE}>None</SelectItem>
                <SelectItem value={InteractionModeConst.PAN}>Pan</SelectItem>
                <SelectItem value={InteractionModeConst.ZOOM}>Zoom</SelectItem>
                <SelectItem value={InteractionModeConst.BOTH}>Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tooltip */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tooltip">Enable Tooltip</Label>
              <Switch
                id="tooltip"
                checked={chartSettings.tooltip}
                onCheckedChange={(checked) => updateSetting("tooltip", checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
