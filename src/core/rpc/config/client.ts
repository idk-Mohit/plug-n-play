// Local main-thread service (no React/hooks)
import * as LocalStore from "@/core/storage/localStorage";
import { V, type RpcRequest, type RpcResponse } from "./protocol";

type OkResponse<T = unknown> = RpcResponse & { ok: true; result: T };
type ErrResponse = RpcResponse & { ok: false; error: unknown };

export class MiniGrpc {
  private w: Worker;
  private inflight = new Map<string, (msg: RpcResponse) => void>();
  /** Last completed worker RPC round-trip (ms), Chrome performance clock. */
  private lastRttMs: number | undefined;

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
      return this.dispatchLocal<T>(method);
    }

    // 2) Worker routes
    const id = crypto.randomUUID();
    const req: RpcRequest = {
      v: V,
      id,
      svc,
      method,
      args,
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
    const t0 = performance.now();

    // #region agent log
    const __agentInflight = this.inflight.size;
    if (__agentInflight % 25 === 0 && __agentInflight > 0) {
      fetch('http://127.0.0.1:7607/ingest/2d7e6e54-26fe-443a-8f04-dd7367f469d2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3c2b1a' },
        body: JSON.stringify({
          sessionId: '3c2b1a',
          runId: 'memory-bug',
          hypothesisId: 'H2',
          location: 'client.ts:MiniGrpc.call',
          message: 'RPC inflight crossed threshold',
          data: { svc, method, inflight: __agentInflight, argsBytes: JSON.stringify(args).length },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion

    this.w.postMessage(req);

    try {
      const msg = await respP;

      if (this.isErrResponse(msg)) {
        const errObj = (msg as ErrResponse).error as {
          message?: string;
          code?: string;
        };
        const m =
          (errObj && (errObj.message ?? errObj.code)) || "RPC error";
        throw new Error(String(m));
      }

      if (!this.isOkResponse<T>(msg)) {
        throw new Error("Malformed RPC response");
      }

      return (msg as OkResponse<T>).result;
    } finally {
      this.lastRttMs = performance.now() - t0;
      this.inflight.delete(id);
      if (to) clearTimeout(to);
    }
  }

  /** Pending worker RPCs awaiting a response (excludes LocalStore routes). */
  getInflightCount(): number {
    return this.inflight.size;
  }

  getLastRttMs(): number | undefined {
    return this.lastRttMs;
  }

  // Convenience helpers matching your existing API
  ping(): Promise<{ pong: boolean; t: number }> {
    return this.call("System", "ping");
  }
  pong(): Promise<{ ping: boolean; t: number }> {
    return this.call("System", "pong");
  }

  // -------- Local dispatcher (main thread, same RPC feel) --------
  private async dispatchLocal<T>(method: string): Promise<T> {
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
    if (typeof msg !== "object" || msg === null) return false;
    const o = msg as Record<string, unknown>;
    return o.ok === true && typeof o.id === "string";
  }
  private isErrResponse(msg: RpcResponse | unknown): msg is ErrResponse {
    if (typeof msg !== "object" || msg === null) return false;
    const o = msg as Record<string, unknown>;
    return o.ok === false && typeof o.id === "string";
  }
  private isRpcResponse(x: unknown): x is RpcResponse {
    if (typeof x !== "object" || x === null) return false;
    const o = x as Record<string, unknown>;
    return typeof o["id"] === "string" && typeof o["ok"] === "boolean";
  }
}
