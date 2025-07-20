// @ts-nocheck
import * as d3 from "d3";
import type { timeseriesdata } from "@/types/data.types";
import type { D3Scale } from "../scales/generateScales";

interface AddSvgTooltipProps {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  data: timeseriesdata[];
  xScale: D3Scale;
  yScale: D3Scale;
  enable: boolean;
}

export function addSvgTooltip({
  svg,
  data,
  xScale,
  yScale,
  enable,
}: AddSvgTooltipProps) {
  if (!enable) {
    svg.on("mousemove", null).on("mouseleave", null);
    svg.selectAll("g.tooltip-group").remove();
    return;
  }

  let tooltip = svg.select<SVGGElement>("g.tooltip-group");

  if (tooltip.empty()) {
    tooltip = svg
      .append("g")
      .attr("class", "tooltip-group")
      .style("transition", "300ms ease");
    tooltip
      .append("path")
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 1)
      .attr("style", "border-radius: 5px;");
    tooltip
      .append("text")
      .style("font-size", "13px")
      .style("fill", "white")
      .style("pointer-events", "none");
  }

  const bisect = d3.bisector((d: timeseriesdata) => d.x).center;

  const formatValue = (v: number) =>
    v.toLocaleString("en", { maximumFractionDigits: 2 });
  const formatDate = (d: Date | number) =>
    new Date(d).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  svg
    .on("mousemove", function (event) {
      tooltip.style("display", null);
      tooltip.style("opacity", "1"); // fade in
      const pointer = d3.pointer(event);
      const xm = xScale.invert(pointer[0]);
      const i = bisect(data, xm);
      const d = data[i];

      if (!d || d.y == null) return;

      tooltip.style("display", null);
      tooltip.attr("transform", `translate(${xScale(d.x)},${yScale(d.y)})`);

      const text = tooltip.select("text");
      const path = tooltip.select("path");

      text
        .selectAll("tspan")
        .data([formatDate(d.x), formatValue(d.y)])
        .join("tspan")
        .attr("x", 0)
        .attr("y", (_, i) => `${i * 1.2}em`)
        .attr("font-weight", (_, i) => (i === 0 ? "bold" : "normal"))
        .text((val) => val);

      sizeTooltip(text, path);
    })
    .on("mouseleave", () => {
      tooltip.style("opacity", "0");
      setTimeout(() => {
        tooltip.style("display", "none");
      }, 700);
    });

  function sizeTooltip(
    text: d3.Selection<SVGTextElement, unknown, null, undefined>,
    path: d3.Selection<SVGPathElement, unknown, null, undefined>
  ) {
    const { x, y, width: w, height: h } = text.node()!.getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr(
      "d",
      `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
    );
  }
}

// interface AddHtmlTooltipProps {
//   container: HTMLElement; // chart container (relative)
//   svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
//   data: timeseriesdata[];
//   xScale: D3Scale;
//   yScale: D3Scale;
//   enable: boolean;
// }

// export function addHtmlTooltip({
//   container,
//   svg,
//   data,
//   xScale,
//   yScale,
//   enable,
// }: AddHtmlTooltipProps) {
//   const className = "chart-tooltip";

//   // 🔁 Cleanup if disabled
//   if (!enable) {
//     svg.on("mousemove", null).on("mouseleave", null);
//     container.querySelector(`.${className}`)?.remove();
//     svg.selectAll("circle.hover-circle").remove();
//     return;
//   }

//   // 🧱 Tooltip DOM element
//   let tooltipEl = container.querySelector<HTMLDivElement>(`.${className}`);
//   if (!tooltipEl) {
//     tooltipEl = document.createElement("div");
//     tooltipEl.className = `
//       ${className}
//       absolute pointer-events-none opacity-0
//       transition-opacity duration-300 ease-in-out
//       z-50
//     `.trim();
//     tooltipEl.innerHTML = `
//       <div class="rounded-lg bg-neutral-900 text-white text-sm shadow-lg border border-neutral-700 px-3 py-2">
//         <div class="tooltip-date font-semibold"></div>
//         <div class="tooltip-value mt-1"></div>
//       </div>
//     `;
//     tooltipEl.style.transition = "300ms ease";
//     container.appendChild(tooltipEl);
//   }

//   const dateEl = tooltipEl.querySelector(".tooltip-date")!;
//   const valueEl = tooltipEl.querySelector(".tooltip-value")!;

//   // 🎯 Hover dot
//   let hoverDot = svg.select<SVGCircleElement>("circle.hover-circle");
//   if (hoverDot.empty()) {
//     hoverDot = svg
//       .append("circle")
//       .attr("class", "hover-circle")
//       .attr("r", 5)
//       .attr("fill", "white")
//       .attr("stroke", "#000")
//       .attr("stroke-width", 2)
//       .style("pointer-events", "none")
//       .style("opacity", 0);
//   }

//   // 📅 Formatter
//   const formatDate = (d: number | Date) =>
//     new Date(d).toLocaleDateString("en", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//   const formatValue = (v: number) => v.toFixed(2);

//   // 🎯 Mouse interaction
//   svg
//     .on("mousemove", function (event) {
//       const [xPos] = d3.pointer(event);
//       const xVal = xScale.invert(xPos);

//       const i = findClosestIndex(data, xVal);
//       const d = data[i];
//       if (!d || d.y == null) return;

//       const svgRect = container.getBoundingClientRect();
//       const tooltipRect = tooltipEl.getBoundingClientRect();

//       const x = xScale(d.x);
//       const y = yScale(d.y);

//       tooltipEl.style.left = `${x + svgRect.left - tooltipRect.width / 2}px`;
//       tooltipEl.style.top = `${y + svgRect.top - tooltipRect.height - 8}px`;
//       tooltipEl.classList.remove("opacity-0");
//       tooltipEl.classList.add("opacity-100");

//       dateEl.textContent = formatDate(d.x);
//       valueEl.textContent = formatValue(d.y);

//       hoverDot.attr("cx", x).attr("cy", y).style("opacity", 1);
//     })
//     .on("mouseleave", () => {
//       tooltipEl?.classList.remove("opacity-100");
//       tooltipEl?.classList.add("opacity-0");
//       hoverDot.style("opacity", 0);
//     });
// }

// // ⚡ Precision binary search
// function findClosestIndex(data: timeseriesdata[], xVal: Date | number): number {
//   let low = 0;
//   let high = data.length - 1;
//   let bestIdx = 0;
//   let bestDist = Infinity;

//   while (low <= high) {
//     const mid = Math.floor((low + high) / 2);
//     const midVal = data[mid].x;
//     const dist = Math.abs(+midVal - +xVal);

//     if (dist < bestDist) {
//       bestDist = dist;
//       bestIdx = mid;
//     }

//     if (midVal < xVal) {
//       low = mid + 1;
//     } else {
//       high = mid - 1;
//     }
//   }

//   return bestIdx;
// }
