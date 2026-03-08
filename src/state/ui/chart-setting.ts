/**
 * Chart Settings State Management
 *
 * This module contains Jotai atoms for managing chart configuration and settings.
 * Uses atomFamily to create per-chart state instances.
 */

import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

import {
  ChartType,
  GridType,
  InteractionMode,
  TimeFormat,
  AnimationType,
  PathCurveType,
  curveMap,
} from "@/enums/chart.enums";

/**
 * Supported chart types for visualization
 */
export type { ChartType };

/**
 * Grid display options for charts
 */
export type { GridType };

/**
 * User interaction modes for charts
 */
export type { InteractionMode };

/**
 * Time formatting options for time-based axes
 */
export type { TimeFormat };

/**
 * Animation types for chart transitions
 */
export type { AnimationType };

/**
 * Path curve types for line/area charts
 */
export type { PathCurveType };

/**
 * Maps curve type strings to D3 curve factory functions
 */
export { curveMap };

/**
 * Complete chart configuration interface
 * Contains all visual and behavioral settings for a chart instance
 */
export interface ChartSettings {
  /** Unique identifier for the chart */
  id: string;
  /** Display title for the chart */
  title: string;
  /** Type of visualization to render */
  type: ChartType;
  /** Grid display configuration */
  grid: GridType;
  /** Whether to show X and Y axes */
  showAxes: boolean;
  /** Primary stroke color for the chart */
  stroke: string;
  /** Width of the stroke in pixels */
  strokeWidth: number;
  /** Whether to display individual data points */
  showDataPoints: boolean;
  /** Font size for text elements */
  fontSize: number;
  /** Animation configuration */
  animation: {
    /** Whether animations are enabled */
    enabled: boolean;
    /** Type of animation to use */
    type: AnimationType;
    /** Animation duration in milliseconds */
    duration?: number;
  };
  /** Curve type for line/area charts */
  pathCurve: PathCurveType;
  /** Time format for time-based data */
  timeFormat: TimeFormat;
  /** User interaction mode */
  interaction: InteractionMode;
  /** Whether to show tooltips on hover */
  tooltip: boolean;
}

/**
 * Atom family for managing individual chart settings
 * Creates a separate atom for each chart ID, allowing independent configuration
 *
 * @param id - Unique identifier for the chart
 * @returns Atom containing chart settings with sensible defaults
 */
export const chartSettingsAtomFamily = atomFamily((id: string) =>
  atom<ChartSettings>({
    id,
    title: "Untitled Chart",
    type: ChartType.AREA,
    grid: GridType.NONE,
    showAxes: true,
    stroke: "hsl(201 12% 41%)",
    strokeWidth: 2,
    fontSize: 12,
    showDataPoints: true,
    animation: {
      enabled: true,
      type: AnimationType.DRAW,
      duration: 800,
    },
    pathCurve: PathCurveType.NATURAL,
    timeFormat: TimeFormat.AUTO,
    interaction: InteractionMode.NONE,
    tooltip: true,
  }),
);

/**
 * Atom for managing the full settings drawer state
 * Controls which chart's settings are currently being edited
 */
export const chartFullSettingsDrawerAtom = atom({
  /** Whether the settings drawer is open */
  enabled: false,
  /** ID of the chart whose settings are being edited */
  chartId: "",
});
