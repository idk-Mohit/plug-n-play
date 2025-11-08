// path: src/atoms/rpcActions.atom.js
import { atom } from "jotai";
import { rpcClientAtom } from "./rpcClient.atom";

export const pingActionAtom = atom(null, async (get) => {
  const rpc = get(rpcClientAtom);
  const res = await rpc.ping();
  // do something useful (log, toast, write to a UI atom, etc.)
  console.log("pong:", res);
});

export const pongActionAtom = atom(null, async (get) => {
  const rpc = get(rpcClientAtom);
  const res = await rpc.pong();
  // do something useful (log, toast, write to a UI atom, etc.)
  console.log("ping:", res);
});

export const callActionAtom = atom(null, async (get) => {
  const rpc = get(rpcClientAtom);
  return await rpc.call("LocalStore", "listDatasets");
});
