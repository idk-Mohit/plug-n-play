/**
 * Tooltip helpers for Cartesian charts (time x linear y).
 * Uses bisect on sorted `x` values for nearest-point hover.
 */

import * as d3 from "d3";
import type { timeseriesdata } from "@/types/data.types";
import type { D3Scale } from "../scales/generateScales";

/** Normalize series `x` values for D3 time scales (domain is `Date`). */
function xToDate(x: string | Date): Date {
  return x instanceof Date ? x : new Date(x);
}

/** X-axis scales used with Cartesian charts support invert (time / linear). */
function invertX(xScale: D3Scale, xPixel: number): Date | undefined {
  const scale = xScale as d3.ScaleTime<number, number>;
  if (typeof scale.invert !== "function") return undefined;
  return scale.invert(xPixel);
}

interface AddSvgTooltipProps {
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
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
      .style("transition", "300ms ease")
      .style("pointer-events", "none");
    tooltip
      .append("path")
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 1)
      .attr("style", "border-radius: 5px;")
      .style("pointer-events", "none");
    tooltip
      .append("text")
      .style("font-size", "13px")
      .style("fill", "white")
      .style("pointer-events", "none");
  }

  tooltip.raise();

  const bisect = d3.bisector((d: timeseriesdata) => d.x).center;

  const formatValue = (v: number) =>
    v.toLocaleString("en", { maximumFractionDigits: 2 });
  const formatDate = (d: Date | number) =>
    new Date(d).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const xTime = xScale as d3.ScaleTime<number, number>;

  svg
    .on("mousemove", function (event) {
      tooltip.style("display", null);
      tooltip.style("opacity", "1");
      const pointer = d3.pointer(event)[0];
      const xm = xTime.invert(pointer);
      const i = bisect(data, xm);
      const row = data[i];

      if (!row || row.y == null) return;

      tooltip.style("display", null);
      tooltip.attr(
        "transform",
        `translate(${xTime(xToDate(row.x))},${(yScale as d3.ScaleLinear<number, number>)(row.y)})`,
      );

      const text = tooltip.select<SVGTextElement>("text");
      const path = tooltip.select<SVGPathElement>("path");

      text
        .selectAll<SVGTSpanElement, string>("tspan")
        .data([formatDate(xToDate(row.x)), formatValue(row.y)])
        .join("tspan")
        .attr("x", 0)
        .attr("y", (_, j) => `${j * 1.2}em`)
        .attr("font-weight", (_, j) => (j === 0 ? "bold" : "normal"))
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
    path: d3.Selection<SVGPathElement, unknown, null, undefined>,
  ) {
    const node = text.node();
    if (!node) return;
    const { y, width: w, height: h } = node.getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr(
      "d",
      `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`,
    );
  }
}

interface AddHtmlTooltipProps {
  container: HTMLElement;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  data: timeseriesdata[];
  xScale: D3Scale;
  yScale: D3Scale;
  enable: boolean;
  showArrow?: boolean;
}

export function addHtmlTooltip({
  container,
  svg,
  data,
  xScale,
  yScale,
  enable,
  showArrow = true,
}: AddHtmlTooltipProps) {
  const className = "chart-tooltip";

  svg.on("mousemove", null).on("mouseleave", null);
  container.querySelector(`.${className}`)?.remove();
  svg.selectAll("circle.hover-dot").remove();

  if (!enable) {
    svg.on("mousemove", null).on("mouseleave", null);
    container.querySelector(`.${className}`)?.remove();
    svg.selectAll("circle.hover-dot").remove();
    return;
  }

  let tooltipEl = container.querySelector<HTMLDivElement>(`.${className}`);
  let arrow: HTMLDivElement | null = null;

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = `${className} absolute pointer-events-none opacity-0 transition-opacity duration-300 ease-in-out z-50`.trim();
    tooltipEl.style.transition = "300ms ease";
    tooltipEl.innerHTML = `
      <div class="tooltip-box rounded-lg bg-neutral-900 text-white text-sm shadow-lg border border-neutral-700 px-3 py-2 ">
        <div class="tooltip-date font-semibold"></div>
        <div class="tooltip-value mt-1"></div>
      </div>
    `;
    container.appendChild(tooltipEl);

    if (showArrow) {
      const box = tooltipEl.querySelector<HTMLDivElement>(".tooltip-box");
      if (box) {
        arrow = document.createElement("div");
        arrow.className = "tooltip-arrow";
        Object.assign(arrow.style, {
          position: "absolute",
          bottom: "10px",
          left: "0px",
          transform: "translateX(-50%) rotate(45deg)",
          width: "10px",
          height: "10px",
          background: "inherit",
          borderLeft: "1px solid #404040",
          borderBottom: "1px solid #404040",
          zIndex: "1",
        });
        box.appendChild(arrow);
      }
    }
  }

  const dateEl = tooltipEl.querySelector(".tooltip-date");
  const valueEl = tooltipEl.querySelector(".tooltip-value");
  if (!dateEl || !valueEl) return;

  const g = svg.select<SVGGElement>("g.main-group");
  const transform = g.attr("transform") || "";
  const [, xOff = "0", yOff = "0"] =
    transform.match(/translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\)/) || [];
  const offsetX = parseFloat(xOff);
  const offsetY = parseFloat(yOff);

  const bisect = d3.bisector((d: timeseriesdata) => d.x).center;
  const formatDate = (t: Date | number) =>
    new Date(t).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatValue = (v: number) =>
    v.toLocaleString("en", { maximumFractionDigits: 2 });

  const xTime = xScale as d3.ScaleTime<number, number>;
  const yLinear = yScale as d3.ScaleLinear<number, number>;

  let hoverDot = g.select<SVGCircleElement>("circle.hover-dot");
  if (hoverDot.empty()) {
    hoverDot = g
      .append("circle")
      .attr("class", "hover-dot")
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .style("opacity", "0");
  }

  svg
    .on("mousemove", (event) => {
      const [rawX] = d3.pointer(event);
      const xm = invertX(xScale, rawX - offsetX);
      if (xm === undefined) return;
      const idx = bisect(data, xm);
      const point = data[idx];
      if (!point || point.y == null) return;

      const px = offsetX + xTime(xToDate(point.x));
      const py = offsetY + yLinear(point.y);

      const containerW = container.clientWidth;
      const ttW = tooltipEl.offsetWidth;
      const margin = 10;
      const overflows = px + ttW + margin > containerW;
      const leftPos = overflows ? px - ttW - margin : px + margin;
      tooltipEl.style.left = `${leftPos}px`;
      if (arrow && overflows) {
        arrowStyles(arrow, "right");
      } else if (arrow) {
        arrowStyles(arrow, "left");
      }

      tooltipEl.style.top = `${py - 35}px`;
      tooltipEl.classList.remove("opacity-0");
      tooltipEl.classList.add("opacity-100");

      dateEl.textContent = formatDate(xToDate(point.x));
      valueEl.textContent = formatValue(point.y);

      hoverDot
        .attr("cx", xTime(xToDate(point.x)))
        .attr("cy", yLinear(point.y))
        .style("opacity", "1");
    })
    .on("mouseleave", () => {
      tooltipEl.classList.remove("opacity-100");
      tooltipEl.classList.add("opacity-0");
      hoverDot.style("opacity", "0");
    });
}

function arrowStyles(arrow: HTMLDivElement, direction: "left" | "right") {
  if (direction === "right") {
    arrow.style.left = "unset";
    arrow.style.right = "-10px";
    arrow.style.borderLeft = "unset";
    arrow.style.borderBottom = "unset";
    arrow.style.borderRight = "1px solid #404040";
    arrow.style.borderTop = "1px solid #404040";
  } else {
    arrow.style.right = "unset";
    arrow.style.left = "0px";
    arrow.style.borderRight = "unset";
    arrow.style.borderTop = "unset";
    arrow.style.borderLeft = "1px solid #404040";
    arrow.style.borderBottom = "1px solid #404040";
  }
}
