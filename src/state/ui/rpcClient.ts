/**
 * RPC Client State Management
 * 
 * This module contains Jotai atoms for managing RPC client connections.
 * Handles gRPC client initialization and worker management.
 */

import { atom } from "jotai";

import { getEngineRpc } from "@/core/rpc/engineSingleton";

/**
 * Atom containing the RPC client instance
 * Creates a singleton gRPC client with web worker for performance
 *
 * @value MiniGrpc - The gRPC client instance
 */
export const rpcClientAtom = atom(() => getEngineRpc());
