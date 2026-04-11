import { type RefObject, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * Creates the root `<svg>` and `g.main-group`, wires `ResizeObserver` with debounce,
 * and bumps `renderTrigger` when width changes. Teardown removes the SVG.
 */
export function useCartesianSvgMount(
  containerRef: RefObject<HTMLDivElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
  groupRef: RefObject<SVGGElement | null>,
): number {
  const [renderTrigger, setRenderTrigger] = useState(0);

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
        setRenderTrigger((n) => n + 1);
      }, 250);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      d3.select(container).select("svg").remove();
    };
    // Intentionally empty: run once on mount; refs are stable object identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- containerRef/svgRef/groupRef
  }, []);

  return renderTrigger;
}
