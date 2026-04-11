/**
 * Area series: filled region under the line with a vertical gradient fill.
 */

import * as d3 from "d3";
import { curveMap } from "@/d3-core/core/curves";
import { getGradientFill } from "@/utils/commonFunctions";
import { renderScatterPoints } from "./scatter";
import {
  cartesianGetters,
  clearCartesianSeriesPaths,
  type CurvedPathOptions,
} from "./shared";

export type AreaSeriesOptions<T> = CurvedPathOptions<T>;

const AREA_GRADIENT_ID = "area-gradient";

/**
 * Draws an area path (`class="series-area"`) with `defs` gradient. Optional
 * point overlay matches line behavior when `style.showDataPoints` is set.
 */
export function renderAreaSeries<T>({
  data,
  xKey,
  yKey,
  svg,
  scales,
  style = {},
  curve,
  animation = { enabled: false, duration: 500 },
}: AreaSeriesOptions<T>): void {
  clearCartesianSeriesPaths(svg);
  const { x: xScale, y: yScale } = scales;
  const { getX, getY } = cartesianGetters(xKey, yKey, xScale, yScale);

  const generator = d3
    .area<T>()
    .x(getX)
    .y0(Number(yScale.range()[0]))
    .y1(getY)
    .curve(curveMap[curve]);

  const defs = svg.select("defs").empty()
    ? svg.append("defs")
    : svg.select("defs");

  defs.select(`#${AREA_GRADIENT_ID}`).remove();

  const gradient = defs
    .append("linearGradient")
    .attr("id", AREA_GRADIENT_ID)
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

  const baseStroke = style.stroke || "steelblue";
  const fillColor = getGradientFill(baseStroke);

  gradient.append("stop").attr("offset", "0%").attr("stop-color", fillColor);

  gradient
    .append("stop")
    .attr("offset", "120%")
    .attr("stop-color", "transparent");

  const path = svg.selectAll<SVGPathElement, T>(`.series-area`).data([data]);
  const pathEnter = path.enter().append("path").attr("class", "series-area");
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
    .attr("fill", `url(#${AREA_GRADIENT_ID})`)
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
      className: "point-area",
    });
  } else {
    svg.selectAll(".point-area").remove();
  }
}
