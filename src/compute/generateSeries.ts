/**
 * Worker-backed sample series generation (Vite `?worker` bundle).
 */
import type { timeseriesdata } from "@/types/data.types";
import DataWorker from "./workers/dataWorker.ts?worker";

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
  return new Promise((resolve, reject) => {
    const worker = new DataWorker();

    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as {
        status?: string;
        data?: timeseriesdata[];
        metadata?: GenerateSeriesMetadata;
        message?: string;
      };
      if (d?.status === "working") return;
      if (d?.status === "success" && d.data && d.metadata) {
        worker.terminate();
        resolve({ data: d.data, metadata: d.metadata });
        return;
      }
      if (d?.status === "error") {
        worker.terminate();
        reject(new Error(String(d.message ?? "Data worker error")));
      }
    };

    worker.onerror = (ev) => {
      worker.terminate();
      reject(ev.error ?? new Error("Worker failed to load"));
    };

    worker.postMessage({ task: "generate_series", payload });
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
