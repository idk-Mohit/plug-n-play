// useRpc.ts
import { rpcClientAtom } from "@/state/ui/rpcClient";
import { useAtomValue } from "jotai";
export function useRpc() {
  return useAtomValue(rpcClientAtom);
}
