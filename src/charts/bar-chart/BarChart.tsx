// import { useEffect, useRef } from "react";
// import * as d3 from "d3";
// import data from "../../utils/data.json";

// const LineChart = () => {
//   const svgRef = useRef(null);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     d3.select(svgRef.current).selectAll("*").remove();

//     const w = 900;
//     const h = 300;
//     const margin = { top: 20, right: 30, bottom: 30, left: 40 };

//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", w + margin.left + margin.right)
//       .attr("height", h + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Scales
//     const xScale = d3
//       .scaleTime()
//       .domain(d3.extent(data, (d) => new Date(d.date)))
//       .range([0, w]);

//     const yScale = d3
//       .scaleLinear()
//       .domain([0, d3.max(data, (d) => d.value)])
//       .range([h, 0]);

//     // Axes
//     const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d"));
//     const yAxis = d3.axisLeft(yScale).ticks(5);

//     svg.append("g").call(yAxis);
//     svg.append("g").attr("transform", `translate(0, ${h})`).call(xAxis);

//     // Line Generator
//     const line = d3
//       .line()
//       .x((d) => xScale(new Date(d.date)))
//       .y((d) => yScale(d.value));
//     // Draw Line
//     svg
//       .append("path")
//       .datum(data)
//       .attr("fill", "none")
//       .attr("stroke", "steelblue")
//       .attr("stroke-width", 2)
//       .attr("d", line);
//   }, []);

//   return <svg ref={svgRef} />;
// };

// export default LineChart;
