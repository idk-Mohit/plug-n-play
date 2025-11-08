// Protocol version - src/core/rpc/protocol.ts
export type RpcVersion = 1;
export const V: RpcVersion = 1;

/**
 * RpcRequest is the shape of a request sent from the client to the server.
 *
 * @property {number} v - Protocol version
 * @property {string} id - Request id (uuid)
 * @property {"System"} svc - Service name
 * @property {"ping" | "pong"} method - Method name
 * @property {unknown} [params] - Positional arguments (optional)
 */
export type RpcRequest = {
  v: RpcVersion;
  id: string; // uuid
  svc: "System";
  method: "ping" | "pong";
  params?: unknown;
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
  error: { code: "E_BAD_REQUEST" | "E_INTERNAL"; message: string };
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
