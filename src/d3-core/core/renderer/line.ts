/**
 * Line series: single `<path>` with optional per-point circles (same options as area overlay).
 */

import * as d3 from "d3";
import { curveMap } from "@/d3-core/core/curves";
import { renderScatterPoints } from "./scatter";
import {
  cartesianGetters,
  clearCartesianSeriesPaths,
  type CurvedPathOptions,
} from "./shared";

export type LineSeriesOptions<T> = CurvedPathOptions<T>;

/**
 * Draws a line path (`class="series-line"`). Optionally overlays circles when
 * `style.showDataPoints` is true.
 */
export function renderLineSeries<T>({
  data,
  xKey,
  yKey,
  svg,
  scales,
  style = {},
  curve,
  animation = { enabled: false, duration: 500 },
}: LineSeriesOptions<T>): void {
  clearCartesianSeriesPaths(svg);
  const { x: xScale, y: yScale } = scales;
  const { getX, getY } = cartesianGetters(xKey, yKey, xScale, yScale);

  const generator = d3
    .line<T>()
    .x(getX)
    .y(getY)
    .curve(curveMap[curve]);

  const path = svg.selectAll<SVGPathElement, T>(`.series-line`).data([data]);
  const pathEnter = path.enter().append("path").attr("class", "series-line");
  const merged = pathEnter.merge(path);

  merged.attr("d", generator);

  if (animation.enabled) {
    merged
      .attr("stroke-dasharray", function () {
        const length = (this as SVGPathElement).getTotalLength();
        return `${length},${length}`;
      })
      .attr("stroke-dashoffset", function () {
        return (this as SVGPathElement).getTotalLength();
      })
      .transition()
      .duration(animation.duration ?? 1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  } else {
    merged.attr("stroke-dasharray", null).attr("stroke-dashoffset", null);
  }

  merged
    .attr("fill", "none")
    .attr("stroke", style.stroke || "steelblue")
    .attr("stroke-width", style.strokeWidth ?? 2);

  path.exit().remove();

  if (style?.showDataPoints) {
    renderScatterPoints({
      data,
      xKey,
      yKey,
      svg,
      xScale,
      yScale,
      style,
      animation,
      className: "point-line",
    });
  } else {
    svg.selectAll(".point-line").remove();
  }
}
