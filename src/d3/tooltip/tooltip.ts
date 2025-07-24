// @ts-nocheck
import * as d3 from "d3";
import type { timeseriesdata } from "@/types/data.types";
import type { D3Scale } from "../scales/generateScales";
import { Arrow } from "@radix-ui/react-tooltip";

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

  svg
    .on("mousemove", function (event) {
      tooltip.style("display", null);
      tooltip.style("opacity", "1"); // fade in
      const pointer = d3.pointer(event)[0];
      const xm = xScale.invert(pointer);
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

interface AddHtmlTooltipProps {
  container: HTMLElement; // chart container (position: relative)
  svg: d3.Selection<SVGGElement, unknown, null, undefined>; // your <g.main-group> parent
  data: timeseriesdata[];
  xScale: D3Scale;
  yScale: D3Scale;
  enable: boolean;
}

export function addHtmlTooltip({
  container,
  svg,
  data,
  xScale,
  yScale,
  enable,
  showArrow = true,
}: AddHtmlTooltipProps & { showArrow?: boolean }) {
  const className = "chart-tooltip";

  svg.on("mousemove", null).on("mouseleave", null);
  container.querySelector(`.${className}`)?.remove();
  svg.selectAll("circle.hover-dot").remove();

  // teardown if disabled
  if (!enable) {
    svg.on("mousemove", null).on("mouseleave", null);
    container.querySelector(`.${className}`)?.remove();
    svg.selectAll("circle.hover-dot").remove();
    return;
  }

  // 1️⃣ Create or select the HTML tooltip
  let tooltip = container.querySelector<HTMLDivElement>(
    `.${className} relative`
  );
  let arrow: HTMLDivElement | null = null;

  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = `
      ${className}
      absolute pointer-events-none opacity-0
      transition-opacity duration-300 ease-in-out z-50
    `.trim();

    tooltip.style = "transition: 300ms ease";
    tooltip.innerHTML = `
      <div class="tooltip-box rounded-lg bg-neutral-900 text-white text-sm shadow-lg border border-neutral-700 px-3 py-2 ">
        <div class="tooltip-date font-semibold"></div>
        <div class="tooltip-value mt-1"></div>
      </div>
    `;
    container.appendChild(tooltip);

    // optional arrow
    if (showArrow) {
      const box = tooltip.querySelector<HTMLDivElement>(".tooltip-box")!;
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

  const dateEl = tooltip.querySelector(".tooltip-date")!;
  const valueEl = tooltip.querySelector(".tooltip-value")!;

  // 2️⃣ Grab your main-group <g> and parse its translate() offsets
  const g = svg.select("g.main-group");
  const transform = g.attr("transform") || "";
  const [, xOff = "0", yOff = "0"] =
    transform.match(/translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\)/) || [];
  const offsetX = parseFloat(xOff);
  const offsetY = parseFloat(yOff);

  // 3️⃣ Prepare bisector & formatting
  const bisect = d3.bisector((d: timeseriesdata) => d.x).center;
  const formatDate = (t: Date | number) =>
    new Date(t).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatValue = (v: number) =>
    v.toLocaleString("en", { maximumFractionDigits: 2 });

  // 4️⃣ Create or select the hover-dot in the <g>
  let hoverDot = g.select("circle.hover-dot");
  if (hoverDot.empty()) {
    hoverDot = g
      .append("circle")
      .attr("class", "hover-dot")
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .style("opacity", 0);
  }

  // 5️⃣ Wire up the events on the SVG
  svg
    .on("mousemove", (event) => {
      // raw pointer relative to the <svg>
      const [rawX] = d3.pointer(event);
      // convert to your data-domain x by subtracting the group offset
      const xm = xScale.invert(rawX - offsetX);
      const idx = bisect(data, xm);
      const point = data[idx];
      if (!point || point.y == null) return;

      // compute the exact pixel coords (back in SVG space)
      const px = offsetX + xScale(point.x);
      const py = offsetY + yScale(point.y);

      const containerW = container.clientWidth;
      const ttW = tooltip.offsetWidth;
      const margin = 10;
      const overflows = px + ttW + margin > containerW;
      const leftPos = overflows ? px - ttW - margin : px + margin;
      tooltip.style.left = `${leftPos}px`;
      if (arrow && overflows) {
        arrowStyles(arrow, "right");
      } else {
        arrowStyles(arrow, "left");
      }

      // position and show HTML tooltip
      // tooltip.style.left = `${px + 10}px`; // tweak your x-offset
      tooltip.style.top = `${py - 35}px`; // tweak your y-offset
      tooltip.classList.remove("opacity-0");
      tooltip.classList.add("opacity-100");

      // populate content
      dateEl.textContent = formatDate(point.x);
      valueEl.textContent = formatValue(point.y);

      // show hover dot
      hoverDot
        .attr("cx", xScale(point.x))
        .attr("cy", yScale(point.y))
        .style("opacity", 1);
    })
    .on("mouseleave", () => {
      tooltip.classList.remove("opacity-100");
      tooltip.classList.add("opacity-0");
      hoverDot.style("opacity", 0);
    });
}

function arrowStyles(arrow: SVGElement, direction: "left" | "right") {
  if (!arrow) return;

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
