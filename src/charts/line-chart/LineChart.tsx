// @ts-nocheck
import { Fragment, memo, useEffect, useRef } from "react";
import * as d3 from "d3";
// import data from "../../utils/data.json";
import { generateScale } from "../../d3/scales/generateScales";
import { renderAxes } from "../../d3/axes/generateAxes";
import { renderSeries } from "../../d3/path/generateSeries";
import type { timeseriesdata } from "../../types/data.types";
import { useAtomValue } from "jotai";
import { sidebarTransitionAtom } from "@/atoms/layout";

const LineChart = ({
  data,
  width = 900,
  height = 300,
}: {
  data: timeseriesdata[];
  width?: number;
  height?: number;
}) => {
  const svgRef = useRef(null);
  const isTransitioning = useAtomValue(sidebarTransitionAtom);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const w = width;
    const h = height;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
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

    renderAxes({
      svg,
      scales: { x: xScale, y: yScale },
      height: h,
      // format: { x: d3.timeFormat("%-m/%-d/%Y") },
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
      transition: true,
    });
  }, [data, width, height]);

  return <svg data-hidden={isTransitioning} className="chart" ref={svgRef} />;
};

export default memo(LineChart);
