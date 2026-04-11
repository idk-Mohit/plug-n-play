import { type MutableRefObject, type RefObject, useEffect } from "react";
import * as d3 from "d3";
import { generateGrid } from "@/d3-core/core/grid/gridGenerator";
import { renderAxes } from "@/d3-core/core/axes/generateAxes";
import { renderAreaSeries } from "@/d3-core/core/renderer/area";
import { renderLineSeries } from "@/d3-core/core/renderer/line";
import {
  renderScatterPoints,
  renderScatterSeries,
} from "@/d3-core/core/renderer/scatter";
import type { timeseriesdata } from "@/types/data.types";
import { generateScale } from "@/d3-core/core/scales/generateScales";
import type {
  ChartSettings,
  ChartType,
  GridType,
  PathCurveType,
} from "@/state/ui/chart-setting";
import { ChartType as ChartTypeConst } from "@/enums/chart.enums";
import { addHtmlTooltip } from "@/d3-core/core/tooltip/tooltip";
import { hashCartesianData } from "../utils";

/** Cached paint state so we only touch grid/axes/series when something material changes. */
export interface CartesianLastPaint {
  width: number;
  height: number;
  gridType: GridType;
  pathCurve: PathCurveType;
  showDataPoints: boolean;
  stroke: string;
  type: ChartType;
  dataHash: string;
  xDomain: unknown;
  yDomain: unknown;
  tooltip: boolean;
}

function isLineAreaOrScatter(t: ChartType): boolean {
  return (
    t === ChartTypeConst.LINE ||
    t === ChartTypeConst.AREA ||
    t === ChartTypeConst.SCATTER
  );
}

export interface UseCartesianChartPaintArgs {
  containerRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  groupRef: RefObject<SVGGElement | null>;
  data: timeseriesdata[];
  type: ChartType;
  gridType: GridType;
  chartSettings: ChartSettings;
  renderTrigger: number;
  lastRef: MutableRefObject<CartesianLastPaint | null>;
}

/**
 * Runs the full D3 paint pipeline: margins, scales, grid, axes, series (by type),
 * optional point overlay, and HTML tooltip. Keeps incremental-update checks
 * in one place so `CartesianChart` stays a thin shell.
 */
export function useCartesianChartPaint({
  containerRef,
  svgRef,
  groupRef,
  data,
  type,
  gridType,
  chartSettings,
  renderTrigger,
  lastRef,
}: UseCartesianChartPaintArgs): void {
  useEffect(() => {
    if (!containerRef.current || !svgRef.current || !groupRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const g = d3.select(groupRef.current);

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;
    const width = fullWidth - margin.left - margin.right;
    const chartInnerHeight = fullHeight - margin.top - margin.bottom;

    svg.attr("width", fullWidth).attr("height", fullHeight);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = generateScale({
      data,
      key: "x",
      scaleType: "time",
      range: [0, width],
    });

    const yScale = generateScale({
      data,
      key: "y",
      scaleType: "linear",
      range: [chartInnerHeight, 0],
    });

    const last = lastRef.current;
    if (
      last?.gridType !== gridType ||
      last?.gridType === undefined ||
      last?.width !== width ||
      last?.height !== chartInnerHeight
    ) {
      g.selectAll(".grid").remove();
      generateGrid(g, xScale, yScale, width, chartInnerHeight, gridType);
    }

    if (
      JSON.stringify(last?.xDomain) !== JSON.stringify(xScale.domain()) ||
      JSON.stringify(last?.yDomain) !== JSON.stringify(yScale.domain()) ||
      last?.width !== width
    ) {
      renderAxes({
        svg: g,
        scales: { x: xScale, y: yScale },
        height: chartInnerHeight,
        ticks: { y: 15, x: 10 },
      });
    }

    const seriesReady = isLineAreaOrScatter(type);
    const curvedOpts = {
      data,
      xKey: "x" as const,
      yKey: "y" as const,
      svg: g,
      scales: { x: xScale, y: yScale },
      curve: chartSettings.pathCurve,
      style: {
        stroke: chartSettings.stroke,
        strokeWidth: 2,
        fill: chartSettings.stroke,
      },
      animation: {
        enabled: chartSettings.animation.enabled,
        duration: chartSettings.animation.duration || 500,
      },
    };

    if (
      seriesReady &&
      (last?.pathCurve !== chartSettings.pathCurve ||
        last?.type !== type ||
        last?.dataHash !== hashCartesianData(data) ||
        last?.width !== width ||
        last?.height !== chartInnerHeight ||
        last?.stroke !== chartSettings.stroke)
    ) {
      if (type === ChartTypeConst.LINE) {
        renderLineSeries(curvedOpts);
      } else if (type === ChartTypeConst.AREA) {
        renderAreaSeries(curvedOpts);
      } else if (type === ChartTypeConst.SCATTER) {
        renderScatterSeries({
          data,
          xKey: "x",
          yKey: "y",
          svg: g,
          scales: { x: xScale, y: yScale },
          style: curvedOpts.style,
          animation: curvedOpts.animation,
          className: "series-scatter",
        });
      }
    }

    if (!seriesReady) {
      g.selectAll("[class^='series-']").remove();
      g.selectAll(`[class^="point-"]`).remove();
    }

    if (
      chartSettings.showDataPoints &&
      type !== ChartTypeConst.SCATTER &&
      type !== ChartTypeConst.BAR &&
      seriesReady
    ) {
      renderScatterPoints({
        data,
        xKey: "x",
        yKey: "y",
        svg: g,
        xScale,
        yScale,
        style: {
          radius: 3,
          fill: chartSettings.stroke,
        },
        animation: {
          enabled: chartSettings.animation.enabled,
          duration: chartSettings.animation.duration,
        },
        className: `point-${type}`,
      });
    } else {
      g.selectAll(`[class^="point-"]`).remove();
    }

    addHtmlTooltip({
      container,
      svg,
      data,
      xScale,
      yScale,
      enable: chartSettings.tooltip && seriesReady,
    });

    lastRef.current = {
      width,
      height: chartInnerHeight,
      gridType,
      pathCurve: chartSettings.pathCurve,
      showDataPoints: chartSettings.showDataPoints,
      stroke: chartSettings.stroke,
      type,
      dataHash: hashCartesianData(data),
      xDomain: xScale.domain(),
      yDomain: yScale.domain(),
      tooltip: chartSettings.tooltip,
    };
  }, [
    containerRef,
    svgRef,
    groupRef,
    data,
    type,
    gridType,
    chartSettings,
    renderTrigger,
    lastRef,
  ]);
}
