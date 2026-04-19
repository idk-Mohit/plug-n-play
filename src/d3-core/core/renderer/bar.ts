/**
 * Bar series: one `<rect>` per datum; expects a band scale on X and linear Y.
 */

import * as d3 from "d3";
import { cartesianY, clearCartesianSeriesPaths } from "./shared";
import type { D3Scale } from "@/d3-core/core/scales/generateScales";
import type { timeseriesdata } from "@/types/data.types";

export interface BarSeriesOptions {
  data: timeseriesdata[];
  yKey: keyof timeseriesdata;
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  xScale: d3.ScaleBand<string>;
  yScale: D3Scale;
  chartHeight: number;
  style?: {
    fill?: string;
  };
}

export function renderBarSeries({
  data,
  yKey,
  svg,
  xScale,
  yScale,
  chartHeight,
  style = {},
}: BarSeriesOptions): void {
  clearCartesianSeriesPaths(svg);
  const fill = style.fill ?? "currentColor";

  const bars = svg
    .selectAll<SVGRectElement, timeseriesdata>(".series-bar")
    .data(data, (_, i) => String(i));

  bars.exit().remove();

  const enter = bars
    .enter()
    .append("rect")
    .attr("class", "series-bar")
    .attr("rx", 2)
    .attr("ry", 2);

  const merged = enter.merge(bars);

  merged
    .attr("x", (_, i) => xScale(String(i)) ?? 0)
    .attr("width", xScale.bandwidth())
    .attr("y", (d) => {
      const y = cartesianY(d, yKey, yScale);
      return Math.min(y, chartHeight);
    })
    .attr("height", (d) => {
      const y = cartesianY(d, yKey, yScale);
      return Math.max(0, chartHeight - y);
    })
    .attr("fill", fill);
}
