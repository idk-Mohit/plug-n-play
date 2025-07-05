// src/workers/dataWorker.ts
/// <reference types="vite/client" />
import type { timeseriesdata } from "../types/data.types";
import init, { generate_series } from "../wasm/wasm_math"; // adjust path as needed

let initialized = false;

self.onmessage = async (e) => {
  self.postMessage({ status: "worker ready" });
  const { task, payload } = e.data;

  if (!initialized) {
    await init(); // load wasm only once
    initialized = true;
  }

  if (task === "generate_series") {
    self.postMessage({ status: "working" });
    const result = generate_series(payload.count); // e.g., count = 100000
    const data: timeseriesdata[] = Array.from(result);

    self.postMessage({ status: "success", data });
  } else {
    self.postMessage({ status: "error", message: "Unknown task" });
  }
};
