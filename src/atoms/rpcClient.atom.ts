// path: src/atoms/rpcClient.atom.js
import { MiniGrpc } from "@/core/rpc/config/client";
import { atom } from "jotai";

// module-scoped singleton to avoid multiple Workers
let _rpc: MiniGrpc | null = null;

export const rpcClientAtom = atom(() => {
  if (_rpc) return _rpc;
  const worker = new Worker(
    new URL("@/engine/engine.worker.ts", import.meta.url),
    { type: "module" }
  );
  _rpc = new MiniGrpc(worker);
  return _rpc;
});
