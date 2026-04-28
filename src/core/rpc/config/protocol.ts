// Protocol version - src/core/rpc/config/protocol.ts
export type RpcVersion = 1;
export const V: RpcVersion = 1;

/**
 * Request envelope from UI → engine worker.
 * Use `args` for positional parameters (array), matching worker validation.
 */
export type RpcRequest = {
  v: RpcVersion;
  id: string;
  svc: string;
  method: string;
  args?: unknown[];
  /** Worker-only: set by `engine.worker` per request (not sent from UI). */
  signal?: AbortSignal;
};

/** Client → worker: cancel an in-flight RPC by id. */
export type RpcCancelEnvelope = {
  v: RpcVersion;
  cancel: true;
  id: string;
};

export type RpcOk<T = unknown> = {
  v: RpcVersion;
  id: string;
  ok: true;
  result: T;
};
export type RpcErr = {
  v: RpcVersion;
  id: string;
  ok: false;
  error: { code: "E_BAD_REQUEST" | "E_INTERNAL" | "E_NOT_FOUND"; message: string };
};
export type RpcResponse<T = unknown> = RpcOk<T> | RpcErr;

export const ok = <T>(id: string, result: T): RpcOk<T> => ({
  v: V,
  id,
  ok: true,
  result,
});

export const err = (
  id: string,
  code: RpcErr["error"]["code"],
  message: string
): RpcErr => ({ v: V, id, ok: false, error: { code, message } });
