/**
 * Thin React shell for Cartesian charts: refs, Jotai settings, and hooks that
 * own all imperative D3 work (`useCartesianSvgMount`, `useCartesianChartPaint`).
 */

import { memo, useRef } from "react";
import { useAtomValue } from "jotai";
import { sidebarTransitionAtom } from "@/state/ui/layout";
import type { timeseriesdata } from "@/types/data.types";
import {
  chartSettingsAtomFamily,
  type ChartType,
  type GridType,
} from "@/state/ui/chart-setting";
import { ChartType as ChartTypeConst } from "@/enums/chart.enums";
import {
  useCartesianChartPaint,
  useCartesianSvgMount,
  type CartesianLastPaint,
} from "./hooks";
import { useCartesianViewportInteraction } from "./hooks/useCartesianViewportInteraction";

export interface CartesianChartProps {
  id: string;
  data: timeseriesdata[];
  height?: number;
  type: ChartType;
  gridType?: GridType;
  /** Gallery-style preview: no animation/tooltip; axes/grid from props + settings; not hidden during sidebar animation. */
  preview?: boolean;
  /** When false, wheel/pan viewport updates are disabled (e.g. built-in sample series). */
  interactionEnabled?: boolean;
}

const CartesianChart = ({
  id,
  data,
  height = 300,
  type = ChartTypeConst.LINE,
  gridType = "both",
  preview = false,
  interactionEnabled = true,
}: CartesianChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const lastRef = useRef<CartesianLastPaint | null>(null);

  const isTransitioning = useAtomValue(sidebarTransitionAtom);
  const chartSettings = useAtomValue(chartSettingsAtomFamily(id));

  const renderTrigger = useCartesianSvgMount(
    containerRef,
    svgRef,
    groupRef,
  );

  useCartesianViewportInteraction({
    containerRef,
    chartId: id,
    preview,
    interaction: chartSettings.interaction,
    enabled: interactionEnabled,
  });

  useCartesianChartPaint({
    containerRef,
    svgRef,
    groupRef,
    data,
    type,
    gridType,
    preview,
    chartSettings,
    renderTrigger,
    lastRef,
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${height}px`,
        overflow: "hidden",
      }}
      className={preview ? "chart text-foreground" : "chart"}
      data-hidden={preview ? false : isTransitioning}
    />
  );
};

export default memo(CartesianChart);
