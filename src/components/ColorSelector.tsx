"use client";

import { useState, useMemo } from "react";
import { HslColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useSetAtom } from "jotai";
import { chartSettingsAtomFamily } from "@/atoms/chart-setting";

interface HslColor {
  h: number;
  s: number;
  l: number;
}

export default function ColorSelector({ id }: { id: string }) {
  const [color, setColor] = useState<HslColor>({ h: 210, s: 78, l: 23 });
  const [isOpen, setIsOpen] = useState(false);
  const setChartColor = useSetAtom(chartSettingsAtomFamily(id));

  const hRound = Math.round(color.h);
  const sRound = Math.round(color.s);
  const lRound = Math.round(color.l);

  const hslString = `hsl(${hRound}, ${sRound}%, ${lRound}%)`;
  const hslCss = `hsl(${color.h} ${color.s}% ${color.l}%)`;

  const updateColor = (partial: Partial<HslColor>) => {
    setColor((prev) => {
      const updated = { ...prev, ...partial };
      setChartColor((chartPrev) => ({
        ...chartPrev,
        stroke: `hsl(${updated.h} ${updated.s}% ${updated.l}%)`,
      }));
      return updated;
    });
  };

  const hueGradient = useMemo(
    () =>
      `linear-gradient(to right, 
      hsl(0, ${color.s}%, ${color.l}%),
      hsl(60, ${color.s}%, ${color.l}%),
      hsl(120, ${color.s}%, ${color.l}%),
      hsl(180, ${color.s}%, ${color.l}%),
      hsl(240, ${color.s}%, ${color.l}%),
      hsl(300, ${color.s}%, ${color.l}%),
      hsl(360, ${color.s}%, ${color.l}%))`,
    [color.s, color.l]
  );

  const saturationGradient = useMemo(
    () =>
      `linear-gradient(to right, 
      hsl(${color.h}, 0%, ${color.l}%),
      hsl(${color.h}, 100%, ${color.l}%))`,
    [color.h, color.l]
  );

  const lightnessGradient = useMemo(
    () =>
      `linear-gradient(to right, 
      hsl(${color.h}, ${color.s}%, 0%),
      hsl(${color.h}, ${color.s}%, 50%),
      hsl(${color.h}, ${color.s}%, 100%))`,
    [color.h, color.s]
  );

  const handleColorChange = (newColor: HslColor) => {
    setColor(newColor);
    setChartColor((prev) => ({
      ...prev,
      stroke: `hsl(${newColor.h} ${newColor.s}% ${newColor.l}%)`,
    }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 px-3 gap-3 font-mono text-sm bg-background hover:bg-accent/50 border-border/50"
        >
          <div
            className="w-5 h-5 rounded border border-border/20 flex-shrink-0"
            style={{ backgroundColor: hslCss }}
          />
          <span className="text-xs">{hslString}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          {/* Color Wheel */}
          <div className="flex justify-center">
            <HslColorPicker
              color={color}
              onChange={handleColorChange}
              style={{
                width: "140px",
                height: "140px",
              }}
            />
          </div>

          {/* Live Preview */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div
              className="w-6 h-6 rounded border border-border/20"
              style={{ backgroundColor: hslCss }}
            />
            <span className="font-mono text-xs text-muted-foreground">
              {hslString}
            </span>
          </div>

          {/* HSL Sliders */}
          <div className="space-y-3">
            {/* Hue Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Hue</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {hRound}°
                </span>
              </div>
              <Slider
                value={[color.h]}
                onValueChange={(v) => updateColor({ h: v[0] })}
                max={360}
                step={1}
                className="w-full"
                style={{ background: hueGradient }}
              />
            </div>

            {/* Saturation Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Saturation</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {sRound}%
                </span>
              </div>
              <Slider
                value={[color.s]}
                onValueChange={(v) => updateColor({ s: v[0] })}
                max={100}
                step={1}
                className="w-full"
                style={{ background: saturationGradient }}
              />
            </div>

            {/* Lightness Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Lightness</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {lRound}%
                </span>
              </div>
              <Slider
                value={[color.l]}
                onValueChange={(v) => updateColor({ l: v[0] })}
                max={100}
                step={1}
                className="w-full"
                style={{ background: lightnessGradient }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
