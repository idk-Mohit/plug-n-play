/**
 * Sample series generation — main thread (reliable; worker/WASM optional later).
 */
import { generateSampleSeriesSync } from "./generateSampleSeriesSync";
import type { timeseriesdata } from "@/types/data.types";

export type GenerateSeriesMetadata = {
  count: number;
  generatedAt: string;
  source: "wasm" | "javascript";
};

export type GenerateSeriesResult = {
  data: timeseriesdata[];
  metadata: GenerateSeriesMetadata;
};

export function generateSeries(payload: {
  count: number;
}): Promise<GenerateSeriesResult> {
  const data = generateSampleSeriesSync(payload.count);
  return Promise.resolve({
    data,
    metadata: {
      count: data.length,
      generatedAt: new Date().toISOString(),
      source: "javascript",
    },
  });
}

export async function measureGenerateSeries(payload: {
  count: number;
}): Promise<{
  durationMs: number;
  dataSizeBytes: number;
  result: GenerateSeriesResult;
}> {
  const t0 = performance.now();
  const result = await generateSeries(payload);
  const durationMs = performance.now() - t0;
  const dataSizeBytes = new Blob([JSON.stringify(result.data)]).size;
  return { durationMs, dataSizeBytes, result };
}
