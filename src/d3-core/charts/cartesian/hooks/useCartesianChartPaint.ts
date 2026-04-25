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
import { renderBarSeries } from "@/d3-core/core/renderer/bar";
import type { D3Scale } from "@/d3-core/core/scales/generateScales";
import { hashCartesianData } from "../utils";

/** Cached paint state so we only touch grid/axes/series when something material changes. */
export interface CartesianLastPaint {
  width: number;
  height: number;
  gridType: GridType;
  pathCurve: PathCurveType;
  showDataPoints: boolean;
  showAxes: boolean;
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
  /** Gallery preview: no animation/tooltip; axes/grid follow props + chart settings. */
  preview?: boolean;
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
  preview = false,
  chartSettings,
  renderTrigger,
  lastRef,
}: UseCartesianChartPaintArgs): void {
  useEffect(() => {
    const resetPaintCache = () => {
      lastRef.current = null;
    };

    if (!containerRef.current || !svgRef.current || !groupRef.current) {
      return resetPaintCache;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const g = d3.select(groupRef.current);

    const showAxes = chartSettings.showAxes;
    const margin = preview
      ? showAxes
        ? { top: 8, right: 20, bottom: 36, left: 30 }
        : { top: 8, right: 12, bottom: 8, left: 8 }
      : { top: 20, right: 30, bottom: 30, left: 40 };

    const effectiveGridType = gridType;
    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;
    const width = fullWidth - margin.left - margin.right;
    const chartInnerHeight = fullHeight - margin.top - margin.bottom;

    // Avoid painting with invalid geometry; next run will draw.
    if (width <= 0 || chartInnerHeight <= 0) {
      return resetPaintCache;
    }

    svg.attr("width", fullWidth).attr("height", fullHeight);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    const isBar = type === ChartTypeConst.BAR;

    const xScaleTime = isBar
      ? null
      : generateScale({
          data,
          key: "x",
          scaleType: "time",
          range: [0, width],
        });

    const xBand = isBar
      ? d3
          .scaleBand<string>()
          .domain(data.map((_, i) => String(i)))
          .range([0, width])
          .padding(0.28)
      : null;

    const yScale: D3Scale = isBar
      ? (() => {
          const ys = data.map((d) => d.y);
          const lo = d3.min(ys) ?? 0;
          const hi = d3.max(ys) ?? 1;
          const bottom = Math.min(0, lo);
          const top = Math.max(0, hi);
          const topPad = top === bottom ? top + 1 : top;
          return generateScale({
            data,
            key: "y",
            scaleType: "linear",
            range: [chartInnerHeight, 0],
            domainOverride: [bottom, topPad],
          });
        })()
      : generateScale({
          data,
          key: "y",
          scaleType: "linear",
          range: [chartInnerHeight, 0],
        });

    const xForGrid: D3Scale = (isBar ? xBand! : xScaleTime!) as D3Scale;

    const last = lastRef.current;
    if (
      last?.gridType !== effectiveGridType ||
      last?.gridType === undefined ||
      last?.width !== width ||
      last?.height !== chartInnerHeight
    ) {
      g.selectAll(".grid").remove();
      generateGrid(
        g,
        xForGrid,
        yScale,
        width,
        chartInnerHeight,
        effectiveGridType,
      );
    }

    const axisFormat =
      isBar && data.length
        ? {
            x: (d: unknown) => {
              const i = Number(d);
              const xv = data[i]?.x;
              if (xv == null) return "";
              const dt = xv instanceof Date ? xv : new Date(xv as string);
              return d3.timeFormat("%H:%M")(dt);
            },
          }
        : {};

    const axisTicks = isBar
      ? { y: preview ? 4 : 15 }
      : { y: preview ? 4 : 15, x: preview ? 4 : 10 };

    if (
      JSON.stringify(last?.xDomain) !== JSON.stringify(xForGrid.domain()) ||
      JSON.stringify(last?.yDomain) !== JSON.stringify(yScale.domain()) ||
      last?.width !== width ||
      last?.showAxes !== showAxes ||
      last?.type !== type
    ) {
      renderAxes({
        svg: g,
        scales: { x: xForGrid, y: yScale },
        height: chartInnerHeight,
        format: axisFormat,
        ticks: axisTicks,
        show: showAxes ? { x: true, y: true } : { x: false, y: false },
      });
    }

    const seriesReady = isLineAreaOrScatter(type);
    // Preview: use currentColor + text-foreground on the chart container (see CartesianChart).
    const seriesColor = preview ? "currentColor" : chartSettings.stroke;

    if (
      seriesReady &&
      xScaleTime &&
      (last?.pathCurve !== chartSettings.pathCurve ||
        last?.type !== type ||
        last?.dataHash !== hashCartesianData(data) ||
        last?.width !== width ||
        last?.height !== chartInnerHeight ||
        last?.stroke !== chartSettings.stroke)
    ) {
      const curvedOpts = {
        data,
        xKey: "x" as const,
        yKey: "y" as const,
        svg: g,
        scales: { x: xScaleTime, y: yScale },
        curve: chartSettings.pathCurve,
        style: {
          stroke: seriesColor,
          strokeWidth: 2,
          fill: seriesColor,
        },
        animation: {
          enabled: preview ? false : chartSettings.animation.enabled,
          duration: chartSettings.animation.duration || 500,
        },
      };
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
          scales: { x: xScaleTime, y: yScale },
          style: curvedOpts.style,
          animation: curvedOpts.animation,
          className: "series-scatter",
        });
      }
    }

    if (
      type === ChartTypeConst.BAR &&
      (last?.type !== type ||
        last?.dataHash !== hashCartesianData(data) ||
        last?.width !== width ||
        last?.height !== chartInnerHeight ||
        last?.stroke !== chartSettings.stroke)
    ) {
      renderBarSeries({
        data,
        yKey: "y",
        svg: g,
        xScale: xBand!,
        yScale,
        chartHeight: chartInnerHeight,
        style: { fill: seriesColor },
      });
    }

    if (!seriesReady && type !== ChartTypeConst.BAR) {
      g.selectAll("[class^='series-']").remove();
      g.selectAll(`[class^="point-"]`).remove();
    }

    if (
      chartSettings.showDataPoints &&
      !preview &&
      type !== ChartTypeConst.SCATTER &&
      type !== ChartTypeConst.BAR &&
      seriesReady
    ) {
      renderScatterPoints({
        data,
        xKey: "x",
        yKey: "y",
        svg: g,
        xScale: xScaleTime!,
        yScale,
        style: {
          radius: 3,
          fill: chartSettings.stroke,
        },
        animation: {
          enabled: preview ? false : chartSettings.animation.enabled,
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
      xScale: xScaleTime ?? (xBand as unknown as D3Scale),
      yScale,
      enable: !preview && chartSettings.tooltip && seriesReady,
    });

    lastRef.current = {
      width,
      height: chartInnerHeight,
      gridType: effectiveGridType,
      pathCurve: chartSettings.pathCurve,
      showDataPoints: chartSettings.showDataPoints,
      showAxes,
      stroke: chartSettings.stroke,
      type,
      dataHash: hashCartesianData(data),
      xDomain: xForGrid.domain(),
      yDomain: yScale.domain(),
      tooltip: chartSettings.tooltip,
    };

    return resetPaintCache;
  }, [
    containerRef,
    svgRef,
    groupRef,
    data,
    type,
    gridType,
    preview,
    chartSettings,
    renderTrigger,
    lastRef,
  ]);
}
