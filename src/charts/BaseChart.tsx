import { memo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useAtomValue } from "jotai";
import { sidebarTransitionAtom } from "@/atoms/layout";
import { generateGrid, type GridType } from "@/d3/utils/gridGenerator";
import type { timeseriesdata } from "@/types/data.types";
import { generateScale } from "@/d3/scales/generateScales";
import { renderAxes } from "@/d3/axes/generateAxes";
import { renderSeries } from "@/d3/path/generateSeries";
import { chartSettingsAtomFamily } from "@/atoms/chart-setting";

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
  const lastWidthRef = useRef<number | null>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const isTransitioning = useAtomValue(sidebarTransitionAtom);

  const chartSettings = useAtomValue(chartSettingsAtomFamily(id));

  console.log(chartSettings);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimeout: undefined | NodeJS.Timeout;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const lastWidth = lastWidthRef.current;

        if (lastWidth !== null && Math.abs(newWidth - lastWidth) < 5) {
          return; // avoid micro changes
        }

        lastWidthRef.current = newWidth;

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          setRenderTrigger((prev) => prev + 1); // force rerender
        }, 200); // 200ms debounce
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  useEffect(() => {
    console.log("Rendering");
    if (!data || data.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    d3.select(container).select("svg").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;

    const w = fullWidth - margin.left - margin.right;
    const h = fullHeight - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", fullWidth)
      .attr("height", fullHeight)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = generateScale({
      data,
      key: "x",
      scaleType: "time",
      range: [0, w],
    });

    const yScale = generateScale({
      data,
      key: "y",
      scaleType: "linear",
      range: [h, 0],
    });

    // add grid lines
    generateGrid(svg, xScale, yScale, w, h, gridType);

    renderAxes({
      svg,
      scales: { x: xScale, y: yScale },
      height: h,
      ticks: { y: 15, x: 10 },
    });

    renderSeries({
      type: type,
      data,
      xKey: "x",
      yKey: "y",
      svg,
      scales: { x: xScale, y: yScale },
      curve: chartSettings.pathCurve,
      style: {
        stroke: "steelblue",
        strokeWidth: 2,
        showDataPoints: chartSettings.showDataPoints,
      },
      animation: {
        enabled: chartSettings.animation.enabled,
        duration: chartSettings.animation.duration || 500,
      },
    });
  }, [data, height, renderTrigger, type, gridType, chartSettings]);

  return (
    <>
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
    </>
  );
};

export default memo(BaseChart);
