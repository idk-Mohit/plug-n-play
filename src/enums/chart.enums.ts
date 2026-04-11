/**
 * App-wide chart UI constants (no D3 imports).
 * Line/area curve keys and D3 factories live in `@/d3-core/core/curves`.
 */

/**
 * Supported chart types for visualization (string values persisted in settings).
 */
export const ChartType = {
  LINE: "line",
  AREA: "area",
  SCATTER: "scatter",
  /** Reserved for the upcoming bar implementation; renderer uses cartesian axes. */
  BAR: "bar",
} as const;

export const GridType = {
  NONE: "none",
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
  BOTH: "both",
} as const;

export const InteractionMode = {
  NONE: "none",
  PAN: "pan",
  ZOOM: "zoom",
  BOTH: "both",
} as const;

export const TimeFormat = {
  AUTO: "auto",
  HH_MM: "HH:mm",
  HH_MM_A: "hh:mm a",
  MM_DD: "MM/DD",
} as const;

export const AnimationType = {
  FADE: "fade",
  DRAW: "draw",
  GROW: "grow",
  NONE: "none",
} as const;

export type ChartType = (typeof ChartType)[keyof typeof ChartType];
export type GridType = (typeof GridType)[keyof typeof GridType];
export type InteractionMode =
  (typeof InteractionMode)[keyof typeof InteractionMode];
export type TimeFormat = (typeof TimeFormat)[keyof typeof TimeFormat];
export type AnimationType = (typeof AnimationType)[keyof typeof AnimationType];
