// Local main-thread service (no React/hooks)
import * as LocalStore from "@/core/storage/localStorage";
import type { RpcRequest, RpcResponse } from "./protocol";

type OkResponse<T = unknown> = RpcResponse & { ok: true; result: T };
type ErrResponse = RpcResponse & { ok: false; error: unknown };

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
    const req: RpcRequest = {
      v: V,
      id,
      svc: svc as any,
      method: method as any,
      params: args,
    };

    let to: ReturnType<typeof setTimeout> | null = null;
    const respP = new Promise<RpcResponse>((resolve, reject) => {
      this.inflight.set(id, (msg: RpcResponse) => resolve(msg));
      to = setTimeout(() => {
        this.inflight.delete(id);
        reject(new Error(`RPC timeout: ${svc}.${method}`));
      }, timeoutMs);
    });

    // register before sending to avoid races
    this.w.postMessage(req);

    try {
      const msg = await respP;

      if (this.isErrResponse(msg)) {
        // bubble up backend error as Error
        const errObj = (msg as ErrResponse).error as any;
        const m = (errObj && (errObj.message || errObj.code)) || "RPC error";
        throw new Error(String(m));
      }

      if (!this.isOkResponse<T>(msg)) {
        throw new Error("Malformed RPC response");
      }

      return (msg as OkResponse<T>).result;
    } finally {
      this.inflight.delete(id);
      if (to) clearTimeout(to);
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
  private async dispatchLocal<T>(method: string, args: unknown[]): Promise<T> {
    switch (method) {
      case "listDatasets":
        return LocalStore.listDatasets() as unknown as T;
      // case "listDatasetIds":
      // return LocalStore.listDatasetIds() as unknown as T;
      default:
        throw new Error(`Unknown LocalStore method: ${method}`);
    }
  }

  // -------- Type guards (kept simple) --------
  private isOkResponse<T = unknown>(
    msg: RpcResponse | unknown
  ): msg is OkResponse<T> {
    return (
      !!msg &&
      typeof msg === "object" &&
      (msg as any).ok === true &&
      typeof (msg as any).id === "string"
    );
  }
  private isErrResponse(msg: RpcResponse | unknown): msg is ErrResponse {
    return (
      !!msg &&
      typeof msg === "object" &&
      (msg as any).ok === false &&
      typeof (msg as any).id === "string"
    );
  }
  private isRpcResponse(x: unknown): x is RpcResponse {
    if (typeof x !== "object" || x === null) return false;
    const o = x as Record<string, unknown>;
    return typeof o["id"] === "string" && typeof o["ok"] === "boolean";
  }
}
