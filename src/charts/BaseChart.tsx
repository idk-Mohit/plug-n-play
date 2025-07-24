import { memo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useAtomValue } from "jotai";
import { sidebarTransitionAtom } from "@/atoms/layout";
import { generateGrid } from "@/d3/utils/gridGenerator";
import { renderAxes } from "@/d3/axes/generateAxes";
import { renderScatterPoints, renderSeries } from "@/d3/path/generateSeries";
import type { timeseriesdata } from "@/types/data.types";
import { generateScale } from "@/d3/scales/generateScales";
import { chartSettingsAtomFamily, type GridType } from "@/atoms/chart-setting";
import { addHtmlTooltip } from "@/d3/tooltip/tooltip";

interface BaseChartProps {
  id: string;
  data: timeseriesdata[];
  height?: number;
  type: "line" | "area" | "scatter";
  gridType?: GridType;
}

const BaseChart = ({
  id,
  data,
  height = 300,
  type = "line",
  gridType = "both",
}: BaseChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  // @ts-ignore
  const lastRef = useRef<any>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const isTransitioning = useAtomValue(sidebarTransitionAtom);
  const chartSettings = useAtomValue(chartSettingsAtomFamily(id));

  // 1️⃣ Initialization (SVG + Resize Observer)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Init SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("class", "main-group");

    svgRef.current = svg.node();
    groupRef.current = g.node();

    // Setup ResizeObserver
    let resizeTimeout: NodeJS.Timeout | null = null;
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

  // 2️⃣ Main Render / Update Logic
  useEffect(() => {
    if (!containerRef.current || !svgRef.current || !groupRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const g = d3.select(groupRef.current);

    // Size & margin
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    // Resize chart area
    svg.attr("width", fullWidth).attr("height", fullHeight);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    // Generate scales
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
      range: [height, 0],
    });

    const last = lastRef.current ?? {};
    // 🔁 Grid update
    if (
      last.gridType !== gridType ||
      last.gridType === undefined ||
      last.width !== width ||
      last.height !== height
    ) {
      g.selectAll(".grid").remove();
      generateGrid(g, xScale, yScale, width, height, gridType);
    }

    // 🪜 Axes update (domain or size changed)
    if (
      JSON.stringify(last.xDomain) !== JSON.stringify(xScale.domain()) ||
      JSON.stringify(last.yDomain) !== JSON.stringify(yScale.domain()) ||
      last.width !== width
    ) {
      renderAxes({
        svg: g,
        scales: { x: xScale, y: yScale },
        height,
        ticks: { y: 15, x: 10 },
      });
    }

    // 📈 Series update (data/type/curve changed)
    if (
      last.pathCurve !== chartSettings.pathCurve ||
      last.type !== type ||
      last.dataHash !== hashData(data) ||
      last.width !== width ||
      last.height !== height ||
      last.stroke !== chartSettings.stroke
    ) {
      renderSeries({
        type,
        data,
        xKey: "x",
        yKey: "y",
        svg: g,
        scales: { x: xScale, y: yScale },
        curve: chartSettings.pathCurve,
        style: {
          stroke: chartSettings.stroke,
          strokeWidth: 2,
        },
        animation: {
          enabled: chartSettings.animation.enabled,
          duration: chartSettings.animation.duration || 500,
        },
      });
    }

    // ⚪ Data points update
    if (
      (chartSettings.showDataPoints && type !== "scatter") ||
      (chartSettings.showDataPoints &&
        type !== "scatter" &&
        last.stroke !== chartSettings.stroke)
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

    // addSvgTooltip({
    //   svg: g,
    //   data,
    //   xScale,
    //   yScale,
    //   enable: chartSettings.tooltip,
    // });

    addHtmlTooltip({
      container,
      svg,
      data,
      xScale,
      yScale,
      enable: chartSettings.tooltip,
    });

    // Save current state
    lastRef.current = {
      width,
      height,
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
