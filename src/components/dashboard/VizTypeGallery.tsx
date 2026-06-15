import { useMemo } from "react";

import { ChartCard } from "@/containers/visualizations/ChartCard";
import type { timeseriesdata } from "@/types/data.types";
import { GridType } from "@/enums/chart.enums";
import type { ChartType } from "@/enums/chart.enums";
import { VIZ_CHART_CATALOG } from "@/state/data/dashboard-layout";
import { cn } from "@/lib/utils";
import { Table2 } from "lucide-react";

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

type VizTypeGalleryProps = {
  onAddChart: (chartType: ChartType) => void;
  onAddTable: () => void;
  className?: string;
};

/** Chart type previews with add affordances for the dashboard settings drawer. */
export function VizTypeGallery({
  onAddChart,
  onAddTable,
  className,
}: VizTypeGalleryProps) {
  const data = useMemo(
    () => buildShowcaseSeries(SHOWCASE_POINT_COUNT),
    [],
  );

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {VIZ_CHART_CATALOG.map((cfg) => (
        <button
          key={cfg.type}
          type="button"
          className="group relative rounded-lg text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onAddChart(cfg.type)}
          aria-label={`Add ${cfg.label} chart`}
        >
          <ChartCard
            chartId={`viz-gallery-${cfg.type}`}
            label={cfg.label}
            type={cfg.type}
            gridType={GridType.HORIZONTAL}
            data={data}
          />
          <span className="absolute inset-x-0 bottom-0 rounded-b-lg bg-primary/90 py-1 text-center text-[10px] font-medium text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Add {cfg.label}
          </span>
        </button>
      ))}
      <button
        type="button"
        className="flex h-[244px] w-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/15 text-center transition-colors hover:border-border hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onAddTable}
        aria-label="Add data table"
      >
        <Table2 className="h-8 w-8 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold text-foreground">Data table</span>
        <span className="text-[11px] text-muted-foreground">Paged rows</span>
      </button>
    </div>
  );
}

export { buildShowcaseSeries, SHOWCASE_POINT_COUNT, VIZ_CHART_CATALOG };
