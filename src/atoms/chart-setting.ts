import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export type ChartType = "line" | "area" | "scatter";
export type GridType = "vertical" | "horizontal" | "both" | "none";

export type InteractionMode = "none" | "pan" | "zoom" | "both";
export type TimeFormat = "auto" | "HH:mm" | "hh:mm a" | "MM/DD" | string;
export type AnimationType = "fade" | "draw" | "grow" | "none";

import {
  curveBasis,
  curveBasisClosed,
  curveBasisOpen,
  curveCardinal,
  curveCardinalClosed,
  curveCardinalOpen,
  curveCatmullRom,
  curveCatmullRomClosed,
  curveCatmullRomOpen,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  type CurveFactory,
} from "d3";

export type PathCurveType =
  | "linear"
  | "linearClosed"
  | "basis"
  | "basisClosed"
  | "basisOpen"
  | "cardinal"
  | "cardinalClosed"
  | "cardinalOpen"
  | "catmullRom"
  | "catmullRomClosed"
  | "catmullRomOpen"
  | "monotoneX"
  | "monotoneY"
  | "natural"
  | "step"
  | "stepBefore"
  | "stepAfter";

export const curveMap: Record<PathCurveType, CurveFactory> = {
  linear: curveLinear,
  linearClosed: curveLinearClosed,
  basis: curveBasis,
  basisClosed: curveBasisClosed,
  basisOpen: curveBasisOpen,
  cardinal: curveCardinal,
  cardinalClosed: curveCardinalClosed,
  cardinalOpen: curveCardinalOpen,
  catmullRom: curveCatmullRom,
  catmullRomClosed: curveCatmullRomClosed,
  catmullRomOpen: curveCatmullRomOpen,
  monotoneX: curveMonotoneX,
  monotoneY: curveMonotoneY,
  natural: curveNatural,
  step: curveStep,
  stepBefore: curveStepBefore,
  stepAfter: curveStepAfter,
};

export interface ChartSettings {
  id: string;
  title: string;
  type: ChartType;
  grid: GridType;
  showAxes: boolean;
  stroke: string;
  strokeWidth: number;
  showDataPoints: boolean;
  fontSize: number;
  animation: {
    enabled: boolean;
    type: AnimationType;
    duration?: number;
  };
  pathCurve: PathCurveType;
  timeFormat: TimeFormat;
  interaction: InteractionMode;
  tooltip: boolean;
}

export const chartSettingsAtomFamily = atomFamily((id: string) =>
  atom<ChartSettings>({
    id,
    title: "Untitled Chart",
    type: "area",
    grid: "none",
    showAxes: true,
    stroke: "hsl(201 12% 41%)",
    strokeWidth: 2,
    fontSize: 12,
    showDataPoints: true,
    animation: {
      enabled: true,
      type: "draw",
      duration: 800,
    },
    pathCurve: "natural",
    timeFormat: "auto",
    interaction: "none",
    tooltip: true,
  })
);

export const chartFullSettingsDrawerAtom = atom({
  enabled: false,
  chartId: "",
});
