/**
 * D3 Axes Generation Utilities
 * 
 * This module provides a unified interface for creating and managing D3 axes
 * with support for custom formatting, animations, and visibility controls.
 */

import * as d3 from "d3";
import type { D3Scale } from "@/d3-core/core/scales/generateScales";

/**
 * Type definition for axis formatting functions
 * Used to customize tick labels on axes
 */
type AxisFormatter =
  | ((domainValue: unknown | string | Date, index: number) => string)
  | null;

/**
 * Configuration interface for axis rendering
 * Defines all parameters needed to create and customize D3 axes
 */
interface RenderAxisOptions {
  /** SVG group element where axes will be rendered */
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** X and Y scales for axis positioning */
  scales: { x: D3Scale; y: D3Scale };
  /** Height of the chart area (for X-axis positioning) */
  height: number;
  /** Custom formatting functions for tick labels */
  format?: {
    x?: AxisFormatter;
    y?: AxisFormatter;
  };
  /** Number of ticks to display on each axis */
  ticks?: {
    x?: number;
    y?: number;
  };
  /** Visibility controls for each axis */
  show?: {
    x?: boolean;
    y?: boolean;
  };
  /** Animation configuration for axis transitions */
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
}

/**
 * Renders X and Y axes on the provided SVG element using D3 scales.
 * Supports custom formatting, animations, and visibility controls.
 * 
 * @param options - Configuration object containing axis parameters
 * 
 * @example
 * ```typescript
 * renderAxes({
 *   svg: chartGroup,
 *   scales: { x: timeScale, y: linearScale },
 *   height: 300,
 *   format: { 
 *     x: (date) => d3.timeFormat('%b %d')(date as Date),
 *     y: (value) => `$${value}`
 *   },
 *   ticks: { x: 10, y: 15 },
 *   animation: { enabled: true, duration: 500 }
 * });
 * ```
 */
function renderAxes({
  svg,
  scales,
  height,
  format = {},
  ticks = {},
  show = { x: true, y: true },
  animation = { enabled: false, duration: 300 },
}: RenderAxisOptions): void {
  const { x: xScale, y: yScale } = scales;

  // Configure animation transition
  const transition = d3
    .transition()
    .duration(animation.enabled ? animation?.duration ?? 300 : 0);

  // --- X Axis ---
  const xAxisGen = d3.axisBottom(
    xScale as unknown as d3.AxisScale<d3.AxisDomain>
  );
  
  // Apply custom formatting if provided
  if (format.x) xAxisGen.tickFormat(format.x);
  if (ticks.x) xAxisGen.ticks(ticks.x);

  // Get or create X axis element
  let xAxis = svg.select<SVGGElement>(".x-axis");
  if (xAxis.empty()) {
    xAxis = svg.append("g").attr("class", "x-axis");
  }

  // Update X axis visibility and content
  if (show.x !== false) {
    xAxis
      .style("display", null)
      .attr("transform", `translate(0, ${height})`)
      .transition(transition)
      .call(xAxisGen);
  } else {
    xAxis.style("display", "none");
  }

  // --- Y Axis ---
  const yAxisGen = d3.axisLeft(
    yScale as unknown as d3.AxisScale<d3.AxisDomain>
  );
  
  // Apply custom formatting if provided
  if (format.y) yAxisGen.tickFormat(format.y);
  if (ticks.y) yAxisGen.ticks(ticks.y);

  // Get or create Y axis element
  let yAxis = svg.select<SVGGElement>(".y-axis");
  if (yAxis.empty()) {
    yAxis = svg.append("g").attr("class", "y-axis");
  }

  // Update Y axis visibility and content
  if (show.y !== false) {
    yAxis.style("display", null).transition(transition).call(yAxisGen);
  } else {
    yAxis.style("display", "none");
  }
}

export { renderAxes };
export type { RenderAxisOptions, AxisFormatter };
