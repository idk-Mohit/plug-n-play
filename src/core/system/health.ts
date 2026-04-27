import type { SystemSample } from "./types";

export type HealthLevel = "ok" | "warn" | "bad";

/**
 * Worst-of thresholds for quick UI health (FPS, long tasks, main heap vs limit).
 * FPS is ignored when 0 (e.g. hidden-tab minimal sample).
 */
export function computeHealth(sample: SystemSample | null): HealthLevel {
  if (!sample) return "ok";
  let worst: HealthLevel = "ok";
  const bump = (h: HealthLevel) => {
    if (h === "bad") worst = "bad";
    else if (h === "warn" && worst !== "bad") worst = "warn";
  };

  if (sample.fps > 0) {
    if (sample.fps < 15) bump("bad");
    else if (sample.fps < 30) bump("warn");
  }

  if (sample.longTaskMs > 500) bump("bad");
  else if (sample.longTaskMs > 200) bump("warn");

  const { heap } = sample;
  if (heap?.used != null && heap.limit != null && heap.limit > 0) {
    const r = heap.used / heap.limit;
    if (r > 0.9) bump("bad");
    else if (r > 0.7) bump("warn");
  }

  return worst;
}
