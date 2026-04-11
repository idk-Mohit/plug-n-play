/**
 * D3 line/area curve factories live here — not in `enums/` or `state/`.
 *
 * Rendering code imports `curveMap` so the dependency direction is:
 * `d3-core` (rendering) owns D3 curve logic; UI/state only stores which key was chosen.
 */

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
 * Selectable curve names for line and area series (matches persisted settings keys).
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

export type PathCurveType =
  (typeof PathCurveType)[keyof typeof PathCurveType];

/**
 * Maps each persisted curve key to a D3 curve factory for path generators.
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
