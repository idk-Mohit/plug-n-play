import * as d3 from "d3";
import type { D3Scale } from "../scales/generateScales";

type AxisFormatter =
  | ((domainValue: unknown | string | Date, index: number) => string)
  | null;

interface RenderAxisOptions {
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  scales: { x: D3Scale; y: D3Scale };
  height: number;
  format?: {
    x?: AxisFormatter;
    y?: AxisFormatter;
  };
  ticks?: {
    x?: number;
    y?: number;
  };
  show?: {
    x?: boolean;
    y?: boolean;
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
}

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

  const transition = d3
    .transition()
    .duration(animation.enabled ? animation?.duration ?? 300 : 0);

  // --- X Axis ---
  const xAxisGen = d3.axisBottom(
    xScale as unknown as d3.AxisScale<d3.AxisDomain>
  );
  if (format.x) xAxisGen.tickFormat(format.x);
  if (ticks.x) xAxisGen.ticks(ticks.x);

  let xAxis = svg.select<SVGGElement>(".x-axis");
  if (xAxis.empty()) {
    xAxis = svg.append("g").attr("class", "x-axis");
  }

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
  if (format.y) yAxisGen.tickFormat(format.y);
  if (ticks.y) yAxisGen.ticks(ticks.y);

  let yAxis = svg.select<SVGGElement>(".y-axis");
  if (yAxis.empty()) {
    yAxis = svg.append("g").attr("class", "y-axis");
  }

  if (show.y !== false) {
    yAxis.style("display", null).transition(transition).call(yAxisGen);
  } else {
    yAxis.style("display", "none");
  }
}

export { renderAxes };
export type { RenderAxisOptions, AxisFormatter };
