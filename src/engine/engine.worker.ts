/* eslint-disable no-restricted-globals */

import type { RpcRequest } from "@/core/rpc/config/protocol";

/**
 * ------------------------------------------------------------
 * Minimal RPC Worker — easy to read & extend
 * ------------------------------------------------------------
 *
 * Handles RPC-style messages of the form:
 *   { v, id, svc, method, args? }
 *
 * Responds with:
 *   { id, ok: true, result }       // success
 *   { id, ok: false, error: { code, message } }  // failure
 *
 * ------------------------------------------------------------
 */

/**
 * @typedef {Object} RpcRequest
 * @property {number} v - Protocol version
 * @property {string} id - Unique request ID
 * @property {string} svc - Service name (e.g., "System")
 * @property {string} method - Method name (e.g., "ping")
 * @property {Array<any>} [args] - Optional arguments
 */

/**
 * @typedef {Object} RpcResponse
 * @property {string} id
 * @property {boolean} ok
 * @property {any} [result]
 * @property {{ code: string, message: string }} [error]
 */

// ---- Protocol constants & helpers ----

// Increment this if you change the message format
const V = 1;

// Create a success response
export function ok<T>(id: string, result: T) {
  return { id, ok: true as const, result };
}

export function err(id: string, code: string, message: string) {
  return { id, ok: false as const, error: { code, message } };
}

// ---- Handlers ----
// Each handler gets a validated RpcRequest and must return a response.

const routes = {
  // Responds to System.ping
  "System.ping": async (req: RpcRequest) => {
    return ok(req.id, { pong: true, t: Date.now() });
  },

  // Responds to System.pong
  "System.pong": async (req: RpcRequest) => {
    return ok(req.id, { ping: true, t: Date.now() });
  },
};

// ---- Validation helpers ----

/**
 * Validate that a payload looks like an RPC request.
 * Returns an object with { valid: boolean, reason?: string }.
 */
function validateEnvelope(payload) {
  if (typeof payload !== "object" || payload === null) {
    return { valid: false, reason: "payload is not an object" };
  }

  const { v, id, svc, method, args } = payload;

  if (v !== V) return { valid: false, reason: "version mismatch" };
  if (typeof svc !== "string" || !svc)
    return { valid: false, reason: "missing svc" };
  if (typeof method !== "string" || !method)
    return { valid: false, reason: "missing method" };
  if (args !== undefined && !Array.isArray(args))
    return { valid: false, reason: "args must be an array if provided" };
  if (id !== undefined && typeof id !== "string")
    return { valid: false, reason: "id must be a string if provided" };

  return { valid: true };
}

// Helper to form a lookup key like "System.ping"
function routeKey(svc, method) {
  return `${svc}.${method}`;
}

// ---- Worker message handler ----

self.onmessage = async (ev) => {
  const payload = ev.data;

  // Use provided id if available, otherwise generate one.
  const msgId =
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.id === "string"
      ? payload.id
      : crypto.randomUUID();

  // Validate the RPC envelope
  const { valid, reason } = validateEnvelope(payload);
  if (!valid) {
    self.postMessage(
      err(msgId, "E_BAD_REQUEST", `Invalid RPC envelope: ${reason}`)
    );
    return;
  }

  // Normalize request (always ensure args is an array)
  const req = {
    v: V,
    id: msgId,
    svc: payload.svc,
    method: payload.method,
    args: Array.isArray(payload.args) ? payload.args : [],
  };

  const key = routeKey(req.svc, req.method);
  const handler = routes[key];

  // If route doesn't exist
  if (!handler) {
    self.postMessage(err(req.id, "E_NOT_FOUND", `Unknown RPC method: ${key}`));
    return;
  }

  // Execute the handler and return the result
  try {
    const res = await handler(req);

    // Defensive: if handler returned a raw value, wrap it as ok()
    if (!res || typeof res !== "object" || typeof res.ok !== "boolean") {
      self.postMessage(ok(req.id, res));
      return;
    }

    self.postMessage(res);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    self.postMessage(err(req.id, "E_INTERNAL", message));
  }
};
