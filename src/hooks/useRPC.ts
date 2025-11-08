// useRpc.ts
import { rpcClientAtom } from "@/atoms/rpcClient.atom";
import { useAtomValue } from "jotai";
export function useRpc() {
  return useAtomValue(rpcClientAtom);
}
