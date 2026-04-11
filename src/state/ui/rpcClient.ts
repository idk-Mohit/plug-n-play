/**
 * RPC Client State Management
 * 
 * This module contains Jotai atoms for managing RPC client connections.
 * Handles gRPC client initialization and worker management.
 */

import { MiniGrpc } from "@/core/rpc/config/client";
import { atom } from "jotai";

// Module-scoped singleton to avoid multiple Workers
let _rpc: MiniGrpc | null = null;

/**
 * Atom containing the RPC client instance
 * Creates a singleton gRPC client with web worker for performance
 * 
 * @value MiniGrpc - The gRPC client instance
 */
export const rpcClientAtom = atom(() => {
  if (_rpc) return _rpc;
  const worker = new Worker(
    new URL("@/engine/engine.worker.ts", import.meta.url),
    { type: "module" }
  );
  _rpc = new MiniGrpc(worker);
  return _rpc;
});
