import * as d3 from "d3";
import type { D3Scale } from "@/d3-core/core/scales/generateScales";
import { curveMap, type PathCurveType } from "@/d3-core/core/curves";
import { getGradientFill } from "@/utils/commonFunctions";
import {
  ChartType as ChartTypeConst,
  type ChartType as ChartTypeValue,
} from "@/enums/chart.enums";

/**
 * Chart kinds handled by this module. Bar series will use a dedicated renderer
 * once implemented; `BAR` is excluded at the type level until then.
 */
export type RenderSeriesChartType = Exclude<
  ChartTypeValue,
  typeof ChartTypeConst.BAR
>;

interface RenderSeriesOptions<T> {
  type: RenderSeriesChartType;
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  scales: {
    x: D3Scale;
    y: D3Scale;
  };
  style?: {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    radius?: number;
    showDataPoints?: boolean;
  };
  curve?: PathCurveType;
  animation?: {
    enabled: boolean;
    duration?: number;
  };
}

/**
 * Renders a single X/Y series (line, area, or scatter) into a chart group.
 */
function renderSeries<T>({
  type,
  data,
  xKey,
  yKey,
  svg,
  scales,
  style = {},
  curve = "linear",
  animation = { enabled: false, duration: 500 },
}: RenderSeriesOptions<T>) {
  const { x: xScale, y: yScale } = scales;

  svg.selectAll("[class^='series-']").remove();

  if (type === ChartTypeConst.SCATTER) {
    renderScatterPoints({
      data,
      xKey,
      yKey,
      svg,
      xScale,
      yScale,
      style: {
        fill: style.fill || style.stroke || "steelblue",
        radius: 3,
      },
      animation,
      className: "series-scatter",
    });
    return;
  }

  const getX = (d: T): number => {
    const raw = d[xKey];
    const value = raw instanceof Date ? raw : new Date(raw as string);
    return (xScale as d3.AxisScale<d3.AxisDomain>)(value) ?? 0;
  };

  const getY = (d: T): number => {
    return (yScale as d3.AxisScale<d3.AxisDomain>)(d[yKey] as number) ?? 0;
  };

  const generator =
    type === ChartTypeConst.LINE
      ? d3.line<T>().x(getX).y(getY).curve(curveMap[curve])
      : d3
          .area<T>()
          .x(getX)
          .y0(Number(yScale.range()[0]))
          .y1(getY)
          .curve(curveMap[curve]);

  if (type === ChartTypeConst.AREA) {
    const gradientId = "area-gradient";
    const defs = svg.select("defs").empty()
      ? svg.append("defs")
      : svg.select("defs");

    defs.select(`#${gradientId}`).remove();

    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
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
  }

  const path = svg.selectAll<SVGPathElement, T>(`.series-${type}`).data([data]);

  const pathEnter = path.enter().append("path").attr("class", `series-${type}`);
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
    .attr("fill", type === ChartTypeConst.AREA ? "url(#area-gradient)" : "none")
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
      className: `point-${type}`,
    });
  } else {
    svg.selectAll(`.point-${type}`).remove();
  }
}

function renderScatterPoints<T>({
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
  style?: {
    fill?: string;
    radius?: number;
  };
  animation?: {
    enabled: boolean;
    duration?: number;
  };
  className?: string;
}) {
  const getX = (d: T): number => {
    const raw = d[xKey];
    const value = raw instanceof Date ? raw : new Date(raw as string);
    return (xScale as d3.AxisScale<d3.AxisDomain>)(value) ?? 0;
  };

  const getY = (d: T): number => {
    return (yScale as d3.AxisScale<d3.AxisDomain>)(d[yKey] as number) ?? 0;
  };

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

export { renderSeries, renderScatterPoints };
export type { RenderSeriesOptions };
