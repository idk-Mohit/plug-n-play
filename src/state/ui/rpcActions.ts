/**
 * RPC Actions State Management
 * 
 * This module contains Jotai atoms for RPC actions and operations.
 * Provides async actions for interacting with the RPC client.
 */

import { atom } from "jotai";
import { rpcClientAtom } from "./rpcClient";

/**
 * Atom for ping action - tests RPC connectivity
 * Sends a ping request and logs the response
 */
export const pingActionAtom = atom(null, async (get) => {
  const rpc = get(rpcClientAtom);
  const res = await rpc.ping();
  // do something useful (log, toast, write to a UI atom, etc.)
  console.log("pong:", res);
});

/**
 * Atom for pong action - reverse ping test
 * Sends a pong request and logs the response
 */
export const pongActionAtom = atom(null, async (get) => {
  const rpc = get(rpcClientAtom);
  const res = await rpc.pong();
  // do something useful (log, toast, write to a UI atom, etc.)
  console.log("ping:", res);
});

/**
 * Atom for generic call action - lists datasets
 * Makes a generic RPC call to list available datasets
 */
export const callActionAtom = atom(null, async (get) => {
  const rpc = get(rpcClientAtom);
  return await rpc.call("LocalStore", "listDatasets");
});
