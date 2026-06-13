/**
 * Data Generation Worker
 *
 * Web Worker for generating time series data. Part of the three-layer
 * performance architecture: Main Thread → Workers → WASM (optional later).
 */

/// <reference types="vite/client" />
import { generateSampleSeriesSync } from "@/compute/generateSampleSeriesSync";

let initialized = false;
let wasmAvailable = false;

async function initializeWasm() {
  /** WASM binary is not bundled; skip init until wasm_math_bg.wasm is added. */
  wasmAvailable = false;
  return null;
}

self.onmessage = async (e) => {
  const { task, payload } = e.data;

  if (!initialized) {
    initialized = true;
    void initializeWasm();
  }

  switch (task) {
    case "generate_series":
      await handleGenerateSeries(payload);
      break;

    default:
      self.postMessage({
        status: "error",
        message: `Unknown task: ${task}`,
      });
  }
};

async function handleGenerateSeries(payload: { count: number }) {
  try {
    self.postMessage({ status: "working" });

    const data = generateSampleSeriesSync(payload.count);
    const source: "wasm" | "javascript" = wasmAvailable ? "wasm" : "javascript";

    self.postMessage({
      status: "success",
      data,
      metadata: {
        count: data.length,
        generatedAt: new Date().toISOString(),
        source,
      },
    });
  } catch (error) {
    self.postMessage({
      status: "error",
      message: `Data generation failed: ${error}`,
    });
  }
}

self.addEventListener("message", (e) => {
  if (e.data === "health-check") {
    self.postMessage({
      status: "healthy",
      initialized,
      wasmAvailable,
      capabilities: ["generate_series"],
      timestamp: new Date().toISOString(),
    });
  }
});
