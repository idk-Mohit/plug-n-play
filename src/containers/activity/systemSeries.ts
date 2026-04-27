import type { SystemSample } from "@/core/system/types";
import type { timeseriesdata } from "@/types/data.types";

/** Build D3 time-series points; `x` must be `Date` so `d3.scaleTime` domains work. */
export function systemSamplesToSeries(
  samples: SystemSample[],
  pick: (s: SystemSample) => number | undefined,
): timeseriesdata[] {
  const out: timeseriesdata[] = [];
  for (const s of samples) {
    const y = pick(s);
    if (y === undefined || Number.isNaN(y)) continue;
    out.push({ x: new Date(s.t), y });
  }
  return out;
}
