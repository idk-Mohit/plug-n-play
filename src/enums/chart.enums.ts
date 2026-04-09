/**
 * Chart-related constants to replace string literals
 * Provides type safety and better refactoring capabilities
 */

// D3 curve imports for path rendering
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

/**
 * Supported chart types for visualization
 */
export const ChartType = {
  LINE: "line",
  AREA: "area",
  SCATTER: "scatter",
} as const;

/**
 * Grid display options for charts
 */
export const GridType = {
  NONE: "none",
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  BOTH: "both",
} as const;

/**
 * User interaction modes for charts
 */
export const InteractionMode = {
  NONE: "none",
  PAN: "pan",
  ZOOM: "zoom",
  BOTH: "both",
} as const;

/**
 * Time formatting options for time-based axes
 */
export const TimeFormat = {
  AUTO: "auto",
  HH_MM: "HH:mm",
  HH_MM_A: "hh:mm a",
  MM_DD: "MM/DD",
} as const;

/**
 * Animation types for chart transitions
 */
export const AnimationType = {
  FADE: "fade",
  DRAW: "draw",
  GROW: "grow",
  NONE: "none",
} as const;

/**
 * Path curve types for line/area charts
 */
export const PathCurveType = {
  LINEAR: "linear",
  LINEAR_CLOSED: "linearClosed",
  BASIS: "basis",
  BASIS_CLOSED: "basisClosed",
  BASIS_OPEN: "basisOpen",
  CARDINAL: "cardinal",
  CARDINAL_CLOSED: "cardinalClosed",
  CARDINAL_OPEN: "cardinalOpen",
  CATMULL_ROM: "catmullRom",
  CATMULL_ROM_CLOSED: "catmullRomClosed",
  CATMULL_ROM_OPEN: "catmullRomOpen",
  MONOTONE_X: "monotoneX",
  MONOTONE_Y: "monotoneY",
  NATURAL: "natural",
  STEP: "step",
  STEP_BEFORE: "stepBefore",
  STEP_AFTER: "stepAfter",
} as const;

/**
 * Maps curve type strings to D3 curve factory functions
 * Used to generate smooth paths for line and area charts
 */
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

// Export types for use in interfaces
export type ChartType = (typeof ChartType)[keyof typeof ChartType];
export type GridType = (typeof GridType)[keyof typeof GridType];
export type InteractionMode =
  (typeof InteractionMode)[keyof typeof InteractionMode];
export type TimeFormat = (typeof TimeFormat)[keyof typeof TimeFormat];
export type AnimationType = (typeof AnimationType)[keyof typeof AnimationType];
export type PathCurveType = (typeof PathCurveType)[keyof typeof PathCurveType];
