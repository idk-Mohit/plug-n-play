/**
 * Compute layer — public entry for background work (workers / WASM).
 * Prefer importing from here instead of spawning workers ad hoc in containers.
 */

export {
  generateSeries,
  measureGenerateSeries,
  type GenerateSeriesMetadata,
  type GenerateSeriesResult,
} from "./generateSeries";
