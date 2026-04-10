/**
 * Cartesian chart shell: shared X/Y scales, grid, axes, and line/area/scatter series.
 *
 * Future `ChartType.BAR` will render bars in this same coordinate system; until then
 * selecting Bar in settings shows axes only (no series) so the app stays stable.
 */

import { memo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useAtomValue } from "jotai";
import { sidebarTransitionAtom } from "@/state/ui/layout";
import { generateGrid } from "@/d3-core/core/grid/gridGenerator";
import { renderAxes } from "@/d3-core/core/axes/generateAxes";
import {
  renderScatterPoints,
  renderSeries,
  type RenderSeriesChartType,
} from "@/d3-core/core/renderer/generateSeries";
import type { timeseriesdata } from "@/types/data.types";
import { generateScale } from "@/d3-core/core/scales/generateScales";
import {
  chartSettingsAtomFamily,
  type ChartType,
  type GridType,
  type PathCurveType,
} from "@/state/ui/chart-setting";
import { ChartType as ChartTypeConst } from "@/enums/chart.enums";
import { addHtmlTooltip } from "@/d3-core/core/tooltip/tooltip";

interface BaseChartProps {
  id: string;
  data: timeseriesdata[];
  height?: number;
  type: ChartType;
  gridType?: GridType;
}

/** Cached render state for incremental D3 updates */
interface LastRenderCache {
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

const BaseChart = ({
  id,
  data,
  height = 300,
  type = ChartTypeConst.LINE,
  gridType = "both",
}: BaseChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const lastRef = useRef<LastRenderCache | null>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const isTransitioning = useAtomValue(sidebarTransitionAtom);
  const chartSettings = useAtomValue(chartSettingsAtomFamily(id));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("class", "main-group");

    svgRef.current = svg.node();
    groupRef.current = g.node();

    let resizeTimeout: number | null = null;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimeout!);
      resizeTimeout = setTimeout(() => {
        setRenderTrigger((prev) => prev + 1);
      }, 250);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      d3.select(container).select("svg").remove();
    };
  }, []);

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

    if (
      seriesReady &&
      (last?.pathCurve !== chartSettings.pathCurve ||
        last?.type !== type ||
        last?.dataHash !== hashData(data) ||
        last?.width !== width ||
        last?.height !== chartInnerHeight ||
        last?.stroke !== chartSettings.stroke)
    ) {
      renderSeries({
        type: type as RenderSeriesChartType,
        data,
        xKey: "x",
        yKey: "y",
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
      });
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
      dataHash: hashData(data),
      xDomain: xScale.domain(),
      yDomain: yScale.domain(),
      tooltip: chartSettings.tooltip,
    };
  }, [id, data, type, gridType, chartSettings, renderTrigger]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${height}px`,
        overflow: "hidden",
      }}
      className="chart"
      data-hidden={isTransitioning}
    />
  );
};

function hashData(data: timeseriesdata[]): string {
  return JSON.stringify(data.map((d) => `${d.x}-${d.y}`)).slice(0, 500);
}

export default memo(BaseChart);
