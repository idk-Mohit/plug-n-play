import * as d3 from "d3";
import type { D3Scale } from "../scales/generateScales";
import { curveMap, type PathCurveType } from "@/atoms/chart-setting";

// Supported chart types
type SeriesType = "line" | "area" | "scatter";

// Configuration object for rendering a series
interface RenderSeriesOptions<T> {
  type: SeriesType; // "line", "area", or "scatter"
  data: T[]; // Array of data points
  xKey: keyof T; // Key for x-values
  yKey: keyof T; // Key for y-values
  svg: d3.Selection<SVGGElement, unknown, null, undefined>; // Target SVG group element
  scales: {
    x: D3Scale;
    y: D3Scale;
  };
  style?: {
    stroke?: string; // Stroke color (line/area)
    strokeWidth?: number; // Stroke thickness
    fill?: string; // Fill color (area or scatter)
    radius?: number; // Circle radius (scatter)
    showDataPoints?: boolean; // Whether to show data points
  };
  curve?: PathCurveType; // Curve function
  animation?: {
    enabled: boolean;
    duration?: number; // Duration of animation in milliseconds
  }; // Whether to animate the update
}

/**
 * Render a visual data series into a given SVG group using D3.
 * Supports line, area, and scatter plots.
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

  /**
   * Safely computes scaled X value.
   * Handles both Date and string (ISO) types.
   */
  const getX = (d: T): number => {
    const raw = d[xKey];
    const value = raw instanceof Date ? raw : new Date(raw as string);
    return (xScale as d3.AxisScale<d3.AxisDomain>)(value) ?? 0;
  };

  /**
   * Computes scaled Y value.
   */
  const getY = (d: T): number => {
    return (yScale as d3.AxisScale<d3.AxisDomain>)(d[yKey] as number) ?? 0;
  };

  // ---------- LINE or AREA PATH ----------
  if (type === "line" || type === "area") {
    // Generator for line or area
    const generator =
      type === "line"
        ? d3.line<T>().x(getX).y(getY).curve(curveMap[curve])
        : d3
            .area<T>()
            .x(getX)
            .y0(Number(yScale.range()[0])) // Bottom of chart
            .y1(getY)
            .curve(curveMap[curve]); // Top line of area

    // Select or bind to existing path
    const path = svg
      .selectAll<SVGPathElement, T>(`.series-${type}`)
      .data([data]); // Always a single path, so wrap data in array

    // Create path if it doesn’t exist
    const pathEnter = path
      .enter()
      .append("path")
      .attr("class", `series-${type}`);

    // Merge new and existing path elements
    const merged = pathEnter.merge(path);

    // Apply `d` attribute from generator with optional transition
    // First: set the path's "d" attribute

    merged.attr("d", generator);

    if (style?.showDataPoints) {
      const pointClass = `point-${type}`;

      const points = svg
        .selectAll<SVGCircleElement, T>(`.${pointClass}`)
        .data(data);

      const enter = points
        .enter()
        .append("circle")
        .attr("class", pointClass)
        .attr("cx", getX)
        .attr("cy", getY)
        .attr("r", 0)
        .style("fill", style.fill || "steelblue");

      const merged = enter.merge(points);

      if (animation.enabled) {
        merged
          .transition()
          .duration(animation.duration ?? 500)
          .attr("r", style.radius ?? 3)
          .attr("cx", getX)
          .attr("cy", getY);
      } else {
        merged
          .attr("r", style.radius ?? 3)
          .attr("cx", getX)
          .attr("cy", getY);
      }

      points.exit().remove();
    }

    // Then: draw animation
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
        .duration(animation?.duration ?? 1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    } else {
      merged.attr("stroke-dasharray", null).attr("stroke-dashoffset", null);
    }

    // Style the path
    merged
      .attr("fill", type === "area" ? style.fill || "steelblue" : "none")
      .attr("stroke", style.stroke || "steelblue")
      .attr("stroke-width", style.strokeWidth ?? 2);

    // Remove old paths if needed
    path.exit().remove();
  }

  // ---------- SCATTER POINTS ----------
  if (type === "scatter") {
    // Bind each point to a circle element
    const circles = svg
      .selectAll<SVGCircleElement, T>("circle.point")
      .data(data, (d: T) => d[xKey] + "-" + d[yKey]); // Use unique key for data join

    // Create new circles
    const enter = circles
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("r", 0) // Start radius for animation
      .attr("cx", getX)
      .attr("cy", getY)
      .style("fill", style.fill || "steelblue");

    // Merge new and existing circles
    const merged = enter.merge(
      circles as unknown as d3.Selection<
        SVGCircleElement,
        T,
        SVGGElement,
        unknown
      >
    );

    if (animation.enabled) {
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

    // Remove unused circles
    circles.exit().remove();
  }
}

export { renderSeries };
export type { RenderSeriesOptions, SeriesType };
