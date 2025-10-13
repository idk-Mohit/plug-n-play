import { memo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { generateScale } from "../../d3/scales/generateScales";
import { renderAxes } from "../../d3/axes/generateAxes";
import { renderSeries } from "../../d3/path/generateSeries";
import type { timeseriesdata } from "../../types/data.types";
import { useAtomValue } from "jotai";
import { sidebarTransitionAtom } from "@/atoms/layout";
import { generateGrid } from "@/d3/utils/gridGenerator";
import { Card } from "@/components/ui/card";

const LineChart = ({
  data,
  height = 300,
}: {
  data: timeseriesdata[];
  height?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef<number | null>(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const isTransitioning = useAtomValue(sidebarTransitionAtom);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimeout: undefined | number;
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
    generateGrid(svg, xScale, yScale, w, h);

    renderAxes({
      svg,
      scales: { x: xScale, y: yScale },
      height: h,
      ticks: { y: 15, x: 10 },
    });

    renderSeries({
      type: "line",
      data,
      xKey: "x",
      yKey: "y",
      svg,
      scales: { x: xScale, y: yScale },
      style: { stroke: "steelblue", strokeWidth: 2 },
      animation: { enabled: true, duration: 1000 },
    });
  }, [data, height, renderTrigger]);

  return (
    <Card className="@container/card lg:px-6 px-4 w-[60%]">
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
    </Card>
  );
};

export default memo(LineChart);
