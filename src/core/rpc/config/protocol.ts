// src/core/rpc/config/protocol.ts
export type RpcVersion = 1;
export const V: RpcVersion = 1;

export type SystemService = "System";
export type SystemMethod = "ping" | "pong";

/**
 * Client -> Worker envelope
 */
export type RpcRequest = {
  v: RpcVersion;
  id: string;
  svc: SystemService;
  method: SystemMethod;
  // positional arguments; optional. Keep unknown (not any).
  args?: unknown[];
};

/**
 * OK response
 */
export type RpcOk<T = unknown> = {
  v: RpcVersion;
  id: string;
  ok: true;
  result: T;
};

/**
 * Error response
 */
export type RpcErr = {
  v: RpcVersion;
  id: string;
  ok: false;
  error: {
    code: "E_BAD_REQUEST" | "E_INTERNAL" | "E_NOT_FOUND";
    message: string;
  };
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
): RpcErr => ({
  v: V,
  id,
  ok: false,
  error: { code, message },
});
