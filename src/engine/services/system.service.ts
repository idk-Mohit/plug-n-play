import type { RpcRequest } from "@/core/rpc/config/protocol";
import { ok } from "@/engine/rpcResponse";

/** Per-route RPC hit counts in the worker (diagnostics). */
export const workerRouteHits = new Map<string, number>();

export let workerLastError: { t: number; message: string } | null = null;

export function bumpRouteHit(routeKey: string): void {
  workerRouteHits.set(routeKey, (workerRouteHits.get(routeKey) ?? 0) + 1);
}

export function recordWorkerRouteError(message: string): void {
  workerLastError = { t: Date.now(), message };
}

type ChromeMemory = {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
};

function readHeapSnapshot():
  | { used: number; total: number; limit: number }
  | null {
  const perf = performance as Performance & { memory?: ChromeMemory };
  const m = perf.memory;
  if (!m) return null;
  return {
    used: m.usedJSHeapSize,
    total: m.totalJSHeapSize,
    limit: m.jsHeapSizeLimit,
  };
}

/** Chrome-only `performance.memory`; returns `unavailable` when not exposed. */
export async function getHeap(req: RpcRequest) {
  const snap = readHeapSnapshot();
  if (snap) {
    return ok(req.id, { t: Date.now(), ...snap });
  }
  return ok(req.id, { t: Date.now(), unavailable: true as const });
}

export async function getStats(req: RpcRequest) {
  const snap = readHeapSnapshot();
  return ok(req.id, {
    t: Date.now(),
    heap: snap,
    routeHits: Object.fromEntries(workerRouteHits),
    lastError: workerLastError,
  });
}
