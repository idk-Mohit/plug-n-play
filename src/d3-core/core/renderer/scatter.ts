/**
 * Scatter plot: one circle per datum, D3 enter/update/exit join.
 */

import * as d3 from "d3";
import type { D3Scale } from "@/d3-core/core/scales/generateScales";
import {
  cartesianX,
  cartesianY,
  clearCartesianSeriesPaths,
  type CartesianSeriesBase,
  type CartesianSeriesStyle,
  type SeriesAnimationOptions,
} from "./shared";

export interface ScatterSeriesOptions<T> extends CartesianSeriesBase<T> {
  /** CSS class on circles (e.g. `series-scatter` vs `point-line`). */
  className?: string;
}

/**
 * Renders a scatter-only series (no line path).
 */
export function renderScatterSeries<T>({
  data,
  xKey,
  yKey,
  svg,
  scales,
  style = {},
  animation = { enabled: false, duration: 500 },
  className = "series-scatter",
}: ScatterSeriesOptions<T>): void {
  clearCartesianSeriesPaths(svg);
  renderScatterPoints({
    data,
    xKey,
    yKey,
    svg,
    xScale: scales.x,
    yScale: scales.y,
    style: {
      fill: style.fill || style.stroke || "steelblue",
      radius: 3,
    },
    animation,
    className,
  });
}

/**
 * Renders circles for overlays (e.g. “show points” on line/area) or full scatter.
 */
export function renderScatterPoints<T>({
  data,
  xKey,
  yKey,
  svg,
  xScale,
  yScale,
  style = {},
  animation = { enabled: false, duration: 500 },
  className = "series-scatter",
}: {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  xScale: D3Scale;
  yScale: D3Scale;
  style?: CartesianSeriesStyle;
  animation?: SeriesAnimationOptions;
  className?: string;
}) {
  const getX = (d: T) => cartesianX(d, xKey, xScale);
  const getY = (d: T) => cartesianY(d, yKey, yScale);

  const circles = svg
    .selectAll<SVGCircleElement, T>(`circle.${className}`)
    .data(data, (d: T) => `${d[xKey]}-${d[yKey]}`);

  const enter = circles
    .enter()
    .append("circle")
    .attr("class", className)
    .attr("r", 0)
    .attr("cx", getX)
    .attr("cy", getY)
    .style("fill", style.fill || "steelblue");

  const merged = enter.merge(
    circles as unknown as d3.Selection<
      SVGCircleElement,
      T,
      SVGGElement,
      unknown
    >,
  );

  if (animation?.enabled) {
    merged
      .transition()
      .duration(animation.duration ?? 500)
      .attr("r", style.radius || 3)
      .attr("cx", getX)
      .attr("cy", getY);
  } else {
    merged
      .attr("r", style.radius || 3)
      .attr("cx", getX)
      .attr("cy", getY);
  }

  circles.exit().remove();
}
