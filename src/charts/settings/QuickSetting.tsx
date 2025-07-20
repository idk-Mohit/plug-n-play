// components/ChartQuickSettings.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  type ChartType,
  type GridType,
  chartSettingsAtomFamily,
  chartFullSettingsDrawerAtom,
} from "@/atoms/chart-setting";
import { useAtom, useSetAtom } from "jotai";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";

interface ChartQuickSettingsProps {
  id: string;
}

export function ChartQuickSettings({ id }: ChartQuickSettingsProps) {
  const [settings, setSettings] = useAtom(chartSettingsAtomFamily(id));
  const setOpenFullSettings = useSetAtom(chartFullSettingsDrawerAtom);
  const [open, setOpen] = useState(false);

  const handleMoreSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).blur(); // remove focus from button
    setOpen(false); // close popover
    setOpenFullSettings({ chartId: id, enabled: true }); // open drawer
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <IconSettings size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-fit flex flex-col gap-1.5" align="end">
        <div className="w-fit space-y-1 flex justify-around gap-2 flex-wrap">
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
                {(["line", "area", "scatter"] as ChartType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Grid</Label>
            <Select
              value={settings.grid}
              defaultValue={settings.grid}
              onValueChange={(value) =>
                setSettings({ ...settings, grid: value as GridType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grid" />
              </SelectTrigger>
              <SelectContent>
                {(["both", "vertical", "horizontal", "none"] as GridType[]).map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleMoreSettings} className="cursor-pointer">
          More settings
        </Button>
      </PopoverContent>
    </Popover>
  );
}
