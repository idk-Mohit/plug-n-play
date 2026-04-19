import { useMemo } from "react";

import type { timeseriesdata } from "@/types/data.types";
import { ChartType, GridType } from "@/enums/chart.enums";

import { ChartCard } from "./ChartCard";

/** Small, synchronous series for gallery cards (no worker); keep in the 5–10 range. */
const SHOWCASE_POINT_COUNT = 8;

function buildShowcaseSeries(count: number): timeseriesdata[] {
  const n = Math.min(Math.max(count, 2), 10);
  const stepMs = 60_000;
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => ({
    x: new Date(now - (n - i) * stepMs),
    y: 35 + Math.sin((i / Math.max(n - 1, 1)) * Math.PI) * 30 + i * 2,
  }));
}

const CHART_CARDS = [
  {
    id: "visuals-line",
    type: ChartType.LINE,
    label: "Line",
    gridType: GridType.HORIZONTAL,
  },
  {
    id: "visuals-area",
    type: ChartType.AREA,
    label: "Area",
    gridType: GridType.HORIZONTAL,
  },
  {
    id: "visuals-scatter",
    type: ChartType.SCATTER,
    label: "Scatter",
    gridType: GridType.HORIZONTAL,
  },
  {
    id: "visuals-bar",
    type: ChartType.BAR,
    label: "Bar",
    gridType: GridType.HORIZONTAL,
  },
] as const;

const Visuals = () => {
  const data = useMemo(
    () => buildShowcaseSeries(SHOWCASE_POINT_COUNT),
    [],
  );

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {CHART_CARDS.map((cfg) => (
        <ChartCard
          key={cfg.id}
          chartId={cfg.id}
          label={cfg.label}
          type={cfg.type}
          gridType={cfg.gridType}
          data={data}
        />
      ))}
    </div>
  );
};

export default Visuals;
