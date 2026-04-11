/**
 * Shared helpers for Cartesian (X/Y) series renderers.
 * Line, area, scatter, and future bar/histogram modules import from here
 * so coordinate logic stays in one place.
 */

import * as d3 from "d3";
import type { D3Scale } from "@/d3-core/core/scales/generateScales";
import type { PathCurveType } from "@/d3-core/core/curves";

/** Optional styling passed to line/area/scatter renderers. */
export interface CartesianSeriesStyle {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  radius?: number;
  /** When true, line/area also draw per-point circles (same layer as overlay points). */
  showDataPoints?: boolean;
}

/** Path animation (stroke draw) shared by line and area. */
export interface SeriesAnimationOptions {
  enabled: boolean;
  duration?: number;
}

/** Common inputs for any Cartesian series that maps xKey/yKey through scales. */
export interface CartesianSeriesBase<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  scales: {
    x: D3Scale;
    y: D3Scale;
  };
  style?: CartesianSeriesStyle;
  animation?: SeriesAnimationOptions;
}

/** Line and area share curve interpolation. */
export interface CurvedPathOptions<T> extends CartesianSeriesBase<T> {
  curve: PathCurveType;
}

/**
 * Maps a datum’s x field through the x-scale (time or numeric domain).
 */
export function cartesianX<T>(
  d: T,
  xKey: keyof T,
  xScale: D3Scale,
): number {
  const raw = d[xKey];
  const value = raw instanceof Date ? raw : new Date(raw as string);
  return (xScale as d3.AxisScale<d3.AxisDomain>)(value) ?? 0;
}

/**
 * Maps a datum’s y field through the y-scale (typically linear).
 */
export function cartesianY<T>(
  d: T,
  yKey: keyof T,
  yScale: D3Scale,
): number {
  return (yScale as d3.AxisScale<d3.AxisDomain>)(d[yKey] as number) ?? 0;
}

/**
 * Builds accessors for d3.line / d3.area generators.
 */
export function cartesianGetters<T>(
  xKey: keyof T,
  yKey: keyof T,
  xScale: D3Scale,
  yScale: D3Scale,
) {
  const getX = (d: T) => cartesianX(d, xKey, xScale);
  const getY = (d: T) => cartesianY(d, yKey, yScale);
  return { getX, getY };
}

/**
 * Removes path-based series (classes `series-*`) before drawing a new series type.
 * Call once per paint when switching types or redrawing.
 */
export function clearCartesianSeriesPaths(
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
): void {
  svg.selectAll("[class^='series-']").remove();
}
