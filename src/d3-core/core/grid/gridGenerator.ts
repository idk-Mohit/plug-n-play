import * as d3 from "d3";
import type { D3Scale } from "@/d3-core/core/scales/generateScales";

export type GridType = "horizontal" | "vertical" | "both" | "none";

/**
 * Generates a grid on the provided SVG element using D3 scales.
 *
 * @param svg - The SVG selection to which the grid will be appended.
 * @param xScale - The D3 scale for the x-axis.
 * @param yScale - The D3 scale for the y-axis.
 * @param width - The width of the grid.
 * @param height - The height of the grid.
 * @param gridType - The type of grid to generate: "horizontal", "vertical", "both", or "none".
 *                    Defaults to "both".
 */

export function generateGrid(
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: D3Scale,
  yScale: D3Scale,
  width: number,
  height: number,
  gridType: GridType = "both"
): void {
  svg.selectAll(".grid.vertical").remove();
  svg.selectAll(".grid.horizontal").remove();
  // If the grid type is set to either "vertical", "both", or not specified (defaults to "both"),
  // generate a vertical grid.
  if (gridType === "vertical" || gridType === "both") {
    svg
      // Append a group to the SVG, which will contain the grid lines.
      .append("g")
      // Class the group as a vertical grid.
      .attr("class", "grid vertical")
      // Position the group at the bottom of the SVG.
      .attr("transform", `translate(0, ${height})`)
      // Call the d3 axis generator, passing in the xScale and configuring it to produce
      // vertical grid lines.
      .call(
        d3
          .axisBottom(xScale as unknown as d3.AxisScale<d3.AxisDomain>)
          // Set the tick size to the height of the SVG, so that the grid lines span from
          // the top to the bottom of the SVG.
          .tickSize(-height)
          // Don't display any tick labels.
          .tickFormat(() => "")
      )
      // Remove the domain path from the axis group.
      .call((g) => g.select(".domain").remove())
      // Select all the tick lines (i.e. the grid lines) and set their stroke opacity to 0.1.
      .selectAll(".tick line")
      .attr("stroke-opacity", 0.1);
  }

  // If the grid type is set to either "horizontal", "both", or not specified (defaults to "both"),
  // generate a horizontal grid.
  if (gridType === "horizontal" || gridType === "both") {
    svg
      // Append a group to the SVG, which will contain the grid lines.
      .append("g")
      // Class the group as a horizontal grid.
      .attr("class", "grid horizontal")
      // Call the d3 axis generator, passing in the yScale and configuring it to produce
      // horizontal grid lines.
      .call(
        d3
          .axisLeft(yScale as unknown as d3.AxisScale<d3.AxisDomain>)
          // Set the tick size to the width of the SVG, so that the grid lines span from
          // the left to the right of the SVG.
          .tickSize(-width)
          // Don't display any tick labels.
          .tickFormat(() => "")
      )
      // Remove the domain path from the axis group.
      .call((g) => g.select(".domain").remove())
      // Select all the tick lines (i.e. the grid lines) and set their stroke opacity to 0.1.
      .selectAll(".tick line")
      .attr("stroke-opacity", 0.1);
  }
}
