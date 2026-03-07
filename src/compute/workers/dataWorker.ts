/**
 * Data Generation Worker
 * 
 * Web Worker for generating time series data using WebAssembly.
 * Part of the three-layer performance architecture: Main Thread → Workers → WASM
 * 
 * This worker bridges the gap between the main thread and WASM modules,
 * providing a clean interface for data generation operations.
 */

/// <reference types="vite/client" />
import type { timeseriesdata } from "@/types/data.types";

let initialized = false;
let wasmAvailable = false;

/**
 * Generate sine wave data in JavaScript (fallback when WASM fails)
 */
function generateSineWaveJS(count: number): timeseriesdata[] {
  const data: timeseriesdata[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const x = new Date(now - (count - i) * 1000); // Recent timestamps
    const y = Math.sin((i / count) * 2 * Math.PI) * 100 + Math.random() * 10;
    data.push({ x, y });
  }
  return data;
}

/**
 * Initialize WASM module with fallback
 */
async function initializeWasm() {
  try {
    const wasmModule = await import("@/compute/wasm/wasm_math");
    await wasmModule.default();
    wasmAvailable = true;
    return wasmModule;
  } catch (error) {
    wasmAvailable = false;
    return null;
  }
}

/**
 * Handles incoming messages from the main thread.
 * 
 * Supported tasks:
 * - "generate_series": Generate time series data using WASM or JS fallback
 * 
 * @param {MessageEvent} e The incoming message event
 * @property {string} e.data.task The task to perform
 * @property {Object} e.data.payload The task parameters
 * @emits {MessageEvent} Response with status and data
 */
self.onmessage = async (e) => {
  const { task, payload } = e.data;

  // Initialize WASM module on first use
  if (!initialized) {
    await initializeWasm();
    initialized = true;
  }

  switch (task) {
    case "generate_series":
      await handleGenerateSeries(payload);
      break;
    
    default:
      self.postMessage({ 
        status: "error", 
        message: `Unknown task: ${task}` 
      });
  }
};

/**
 * Handles time series data generation using WASM or JavaScript fallback
 * @param {Object} payload Generation parameters
 * @param {number} payload.count Number of data points to generate
 */
async function handleGenerateSeries(payload: { count: number }) {
  try {
    self.postMessage({ status: "working" });
    
    let data: timeseriesdata[];
    let source: 'wasm' | 'javascript';

    if (wasmAvailable) {
      try {
        // Try to use WASM
        const wasmModule = await import("@/compute/wasm/wasm_math");
        const result = wasmModule.generate_series(payload.count);
        data = Array.from(result);
        source = 'wasm';
      } catch (wasmError) {
        // Use JavaScript fallback
        data = generateSineWaveJS(payload.count);
        source = 'javascript';
      }
    } else {
      // Use JavaScript fallback
      data = generateSineWaveJS(payload.count);
      source = 'javascript';
    }

    self.postMessage({ 
      status: "success", 
      data,
      metadata: {
        count: data.length,
        generatedAt: new Date().toISOString(),
        source
      }
    });
  } catch (error) {
    self.postMessage({ 
      status: "error", 
      message: `Data generation failed: ${error}` 
    });
  }
}

/**
 * Worker health check and status reporting
 */
self.addEventListener('message', (e) => {
  if (e.data === 'health-check') {
    self.postMessage({
      status: 'healthy',
      initialized,
      wasmAvailable,
      capabilities: ['generate_series'],
      timestamp: new Date().toISOString()
    });
  }
});
