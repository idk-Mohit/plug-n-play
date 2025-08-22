import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtom } from "jotai";
import {
  chartFullSettingsDrawerAtom,
  chartSettingsAtomFamily,
  type ChartType,
  type GridType,
  type PathCurveType,
} from "@/atoms/chart-setting";
import { CollapsibleComponent as Collapsible } from "@/components/collapse/Collapsible";
import ColorSelector from "@/components/ColorSelector";

export function ChartFullSettingsDrawer({ id }: { id: string }) {
  const [open, setOpen] = useAtom(chartFullSettingsDrawerAtom);
  const [settings, setSettings] = useAtom(chartSettingsAtomFamily(id));

  return (
    <Drawer
      autoFocus
      direction="right"
      open={open.enabled}
      onOpenChange={(isOpen) => setOpen({ ...open, enabled: isOpen })}
    >
      <DrawerContent className="w-[150px]">
        <DrawerHeader>
          <DrawerTitle>Chart Settings</DrawerTitle>
          <DrawerDescription>
            Customize chart appearance and behavior
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-6 overflow-auto scroll-smooth">
          {/* Basic Settings */}
          <div className="space-y-2">
            <Label>Chart Title</Label>
            <Input
              value={settings.title ?? ""}
              onChange={(e) =>
                setSettings({ ...settings, title: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4  align-center">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select
                value={settings.type}
                onValueChange={(value) =>
                  setSettings({ ...settings, type: value as ChartType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {["line", "area", "scatter"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grid</Label>
              <Select
                value={settings.grid}
                onValueChange={(value) =>
                  setSettings({ ...settings, grid: value as GridType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grid" />
                </SelectTrigger>
                <SelectContent>
                  {["both", "vertical", "horizontal", "none"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Collapsibles */}
          <Collapsible
            data={[
              {
                name: "Styling",
                items: [
                  {
                    type: "checkbox",
                    label: "Show Data Points",
                    value: settings.showDataPoints ?? false,
                    onChange: (val) =>
                      setSettings((prev) => ({
                        ...prev,
                        showDataPoints: val,
                      })),
                  },
                  {
                    type: "select",
                    label: "Curve Type",
                    value: settings.pathCurve ?? "linear",
                    options: [
                      "linear",
                      "linearClosed",
                      "basis",
                      "basisClosed",
                      "basisOpen",
                      "cardinal",
                      "cardinalClosed",
                      "cardinalOpen",
                      "catmullRom",
                      "catmullRomClosed",
                      "catmullRomOpen",
                      "monotoneX",
                      "monotoneY",
                      "natural",
                      "step",
                      "stepBefore",
                      "stepAfter",
                    ],
                    onChange: (val) =>
                      setSettings((prev) => ({
                        ...prev,
                        pathCurve: val as PathCurveType,
                      })),
                  },
                ],
              },
              {
                name: "Axes & Tooltip",
                items: [
                  {
                    type: "checkbox",
                    label: "Show Axes",
                    value: settings.showAxes ?? true,
                    onChange: (val) =>
                      setSettings((prev) => ({
                        ...prev,
                        showAxes: val,
                      })),
                  },
                  {
                    type: "checkbox",
                    label: "Enable Tooltip",
                    value: settings.tooltip ?? true,
                    onChange: () =>
                      setSettings((prev) => ({
                        ...prev,
                        tooltip: !prev.tooltip,
                      })),
                  },
                ],
              },
              {
                name: "Animation",
                items: [
                  {
                    type: "checkbox",
                    label: "Enable Animation",
                    value: settings.animation?.enabled ?? true,
                    onChange: (val) =>
                      setSettings((prev) => ({
                        ...prev,
                        animation: {
                          ...prev.animation,
                          enabled: val,
                        },
                      })),
                  },
                  {
                    type: "select",
                    label: "Duration (ms)",
                    value: String(settings.animation?.duration ?? 300),
                    options: ["300", "500", "700", "1000"],
                    onChange: (val) =>
                      setSettings((prev) => ({
                        ...prev,
                        animation: {
                          ...prev.animation,
                          duration: Number(val),
                        },
                      })),
                  },
                ],
              },
              {
                name: "Interaction",
                items: [
                  {
                    type: "select",
                    label: "Mode",
                    value: settings.interaction ?? "both",
                    options: ["none", "pan", "zoom", "both"],
                    onChange: (val) =>
                      setSettings((prev) => ({
                        ...prev,
                        interaction: val as "none" | "pan" | "zoom" | "both",
                      })),
                  },
                ],
              },
            ]}
          />
          <ColorSelector id={id} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
