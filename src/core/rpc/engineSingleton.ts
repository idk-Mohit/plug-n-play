import { MiniGrpc } from "@/core/rpc/config/client";

let _rpc: MiniGrpc | null = null;

/**
 * Shared engine worker RPC client (single Worker instance for the app).
 * Used by Jotai `rpcClientAtom`, `dataEngine`, and dataset storage mirroring.
 */
export function getEngineRpc(): MiniGrpc {
  if (_rpc) return _rpc;
  const worker = new Worker(
    new URL("@/engine/engine.worker.ts", import.meta.url),
    { type: "module" },
  );
  _rpc = new MiniGrpc(worker);
  return _rpc;
}

/** @internal Vitest */
export function __resetEngineRpcForTests(): void {
  _rpc = null;
}
