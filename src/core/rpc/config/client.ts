// src/core/rpc/minigrpc.ts
import * as LocalStore from "@/core/storage/localStorage";
import { V, type RpcResponse } from "./protocol";

/**
 * Outbound request type used by the main thread when talking to the worker.
 * The protocol's RpcRequest type is strict (svc === "System"), so we use a
 * more relaxed shape here for other services like "LocalStore".
 */
type OutboundRpcRequest = {
  v: number;
  id: string;
  svc: string;
  method: string;
  params?: unknown[];
};

/** Narrow RpcResponse shapes used locally */
type OkResponse<T = unknown> = RpcResponse & { ok: true; result: T };
type ErrResponse = RpcResponse & {
  ok: false;
  error: { code?: string; message?: string };
};

export class MiniGrpc {
  private w: Worker;
  private inflight = new Map<string, (msg: RpcResponse) => void>();

  constructor(worker: Worker) {
    this.w = worker;

    this.w.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as unknown;
      if (!this.isRpcResponse(msg)) return;

      const handler = this.inflight.get(msg.id);
      if (!handler) return;

      this.inflight.delete(msg.id);
      handler(msg);
    };
  }

  // -------- Generic RPC --------
  async call<T = unknown>(
    svc: string,
    method: string,
    args: unknown[] = [],
    opts: { timeout?: number } = {}
  ): Promise<T> {
    const timeoutMs = opts.timeout ?? 10_000;

    // 1) Local main-thread routes (no Worker hop)
    if (svc === "LocalStore") {
      return this.dispatchLocal<T>(method, args);
    }

    // 2) Worker routes
    const id = crypto.randomUUID();
    const req: OutboundRpcRequest = {
      v: V,
      id,
      svc,
      method,
      params: args,
    };

    let to: number | null = null;
    const respP = new Promise<RpcResponse>((resolve, reject) => {
      this.inflight.set(id, (msg: RpcResponse) => resolve(msg));
      to = setTimeout(() => {
        this.inflight.delete(id);
        reject(new Error(`RPC timeout: ${svc}.${method}`));
      }, timeoutMs) as unknown as number;
    });

    // register before sending to avoid races
    this.w.postMessage(req);

    try {
      const msg = await respP;

      if (this.isErrResponse(msg)) {
        const errObj = msg.error;
        const m = (errObj && (errObj.message || errObj.code)) || "RPC error";
        throw new Error(String(m));
      }

      if (!this.isOkResponse<T>(msg)) {
        throw new Error("Malformed RPC response");
      }

      return (msg as OkResponse<T>).result;
    } finally {
      this.inflight.delete(id);
      if (to !== null) clearTimeout(to);
    }
  }

  // Convenience helpers matching your existing API
  ping(): Promise<{ pong: boolean; t: number }> {
    return this.call("System", "ping");
  }
  pong(): Promise<{ ping: boolean; t: number }> {
    return this.call("System", "pong");
  }

  // -------- Local dispatcher (main thread, same RPC feel) --------
  private async dispatchLocal<T>(
    method: string,
    args: unknown[] = []
  ): Promise<T> {
    console.log("LocalStore", method, args);
    switch (method) {
      case "listDatasets":
        // LocalStore.listDatasets() should already be typed; coerce safely
        return (await LocalStore.listDatasets()) as unknown as T;

      // Add other LocalStore methods here, forward args as needed:
      // case "createDataset":
      //   return LocalStore.createDataset(args[0] as CreateDatasetPayload) as unknown as T;

      default:
        throw new Error(`Unknown LocalStore method: ${method}`);
    }
  }

  // -------- Type guards (safe, no `any`) --------
  private isOkResponse<T = unknown>(msg: unknown): msg is OkResponse<T> {
    if (!this.isRpcResponse(msg)) return false;
    const r = msg as RpcResponse;
    return r.ok === true;
  }
  private isErrResponse(msg: unknown): msg is ErrResponse {
    if (!this.isRpcResponse(msg)) return false;
    const r = msg as RpcResponse;
    return r.ok === false;
  }
  private isRpcResponse(x: unknown): x is RpcResponse {
    if (typeof x !== "object" || x === null) return false;
    const o = x as Record<string, unknown>;
    return (
      typeof o["id"] === "string" &&
      typeof o["ok"] === "boolean" &&
      typeof o["v"] !== "undefined"
    );
  }
}
