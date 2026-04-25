import { CartesianChart } from "@/d3-core/charts/cartesian";
import type { timeseriesdata } from "@/types/data.types";
import type { ChartType as ChartTypeSetting, GridType } from "@/state/ui/chart-setting";

export interface ChartCardProps {
  chartId: string;
  label: string;
  type: ChartTypeSetting;
  gridType: GridType;
  data: timeseriesdata[];
}

/**
 * Fixed 300×200 preview card for the Visuals gallery (display-only; no settings drawer).
 */
export function ChartCard({
  chartId,
  label,
  type,
  gridType,
  data,
}: ChartCardProps) {
  return (
    <div
      className="w-[300px] overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm"
      data-chart-preview={chartId}
    >
      <div className="border-b border-border/40 px-2.5 py-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="w-[300px]">
        <CartesianChart
          id={chartId}
          data={data}
          height={200}
          type={type}
          gridType={gridType}
          preview
        />
      </div>
    </div>
  );
}
