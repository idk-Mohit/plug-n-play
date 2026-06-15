import { useMemo } from "react";

import { ChartCard } from "./ChartCard";
import {
  buildShowcaseSeries,
  SHOWCASE_POINT_COUNT,
  VIZ_CHART_CATALOG,
} from "@/components/dashboard/VizTypeGallery";
import { GridType } from "@/enums/chart.enums";

const Visuals = () => {
  const data = useMemo(
    () => buildShowcaseSeries(SHOWCASE_POINT_COUNT),
    [],
  );

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {VIZ_CHART_CATALOG.map((cfg) => (
        <ChartCard
          key={cfg.type}
          chartId={`visuals-${cfg.type}`}
          label={cfg.label}
          type={cfg.type}
          gridType={GridType.HORIZONTAL}
          data={data}
        />
      ))}
    </div>
  );
};

export default Visuals;
