// src/workers/dataWorker.ts
/// <reference types="vite/client" />
import type { timeseriesdata } from "../types/data.types";
import init, { generate_series } from "../wasm/wasm_math"; // adjust path as needed

let initialized = false;

/**
 * Handles incoming messages from the main thread.
 * @param {MessageEvent} e The incoming message event.
 * @property {string} e.data.task The task to perform. Currently only "generate_series" is supported.
 * @property {Object} e.data.payload The payload for the task. For "generate_series", { count: number } is expected.
 * @emits {MessageEvent} A response message with the following properties:
 * @property {string} data.status Either "success", "error", or "working".
 * @property {string} [data.message] An error message if `data.status === "error"`.
 * @property {timeseriesdata[]} [data.data] The generated array of timeseries data if `data.status === "success"`.
 */
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
