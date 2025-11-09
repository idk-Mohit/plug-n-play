// src/core/rpc/minirpc.worker.ts
/* eslint-disable no-restricted-globals */
export {}; // make module scope

import { err, ok, V, type RpcResponse } from "@/core/rpc/config/protocol";

/**
 * A validated request shape for handlers
 */
type ValidatedRequest = {
  v: typeof V;
  id: string;
  svc: "System";
  method: "ping" | "pong";
  args: unknown[]; // always normalized to an array
};

/**
 * Handler type: accepts a validated request and returns a RpcResponse or a raw value
 * (raw values will be wrapped to RpcOk automatically).
 */
type Handler = (req: ValidatedRequest) => Promise<RpcResponse | unknown>;

/**
 * Routes table typed explicitly.
 */
const routes: Record<"System.ping" | "System.pong", Handler> = {
  "System.ping": async (req) => {
    // simple example payload
    return ok(req.id, { pong: true, t: Date.now() });
  },

  "System.pong": async (req) => {
    return ok(req.id, { ping: true, t: Date.now() });
  },
};

// ---- Validation helpers ----

function isObject(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}

/**
 * Validate envelope. Returns { valid, reason }.
 * This function intentionally keeps types narrow without `any`.
 */
function validateEnvelope(
  payload: unknown
): { valid: true } | { valid: false; reason: string } {
  if (!isObject(payload))
    return { valid: false, reason: "payload is not an object" };

  const v = payload["v"];
  const id = payload["id"];
  const svc = payload["svc"];
  const method = payload["method"];
  const args = payload["args"];

  if (v !== V) return { valid: false, reason: "version mismatch" };
  if (typeof svc !== "string" || svc.length === 0)
    return { valid: false, reason: "missing svc" };
  if (typeof method !== "string" || method.length === 0)
    return { valid: false, reason: "missing method" };
  if (args !== undefined && !Array.isArray(args))
    return { valid: false, reason: "args must be an array if provided" };
  if (id !== undefined && typeof id !== "string")
    return { valid: false, reason: "id must be a string if provided" };

  // At this point the payload has the minimal shape — true return includes no extra data
  return { valid: true };
}

/**
 * Convert svc + method to lookup key.
 */
function routeKey(svc: string, method: string): `${string}.${string}` {
  return `${svc}.${method}`;
}

// ---- Worker message handler ----

self.onmessage = async (ev: MessageEvent) => {
  const payload = ev.data as unknown;

  // Determine msgId (if provided and valid string); else fallback to uuid
  const msgId =
    isObject(payload) && typeof payload["id"] === "string"
      ? (payload["id"] as string)
      : crypto.randomUUID();

  // Validate envelope
  const validation = validateEnvelope(payload);
  if (!validation.valid) {
    self.postMessage(
      err(msgId, "E_BAD_REQUEST", `Invalid RPC envelope: ${validation.reason}`)
    );
    return;
  }

  // Now we can safely cast (we normalized); build validated request
  // We still treat svc/method as strings but then narrow to allowed values when forming the key.
  const svc = (payload as Record<string, unknown>)["svc"] as string;
  const method = (payload as Record<string, unknown>)["method"] as string;
  const args = Array.isArray((payload as Record<string, unknown>)["args"])
    ? ((payload as Record<string, unknown>)["args"] as unknown[])
    : [];

  const req: ValidatedRequest = {
    v: V,
    id: msgId,
    svc: svc as "System",
    method: method as "ping" | "pong",
    args,
  };

  const key = routeKey(req.svc, req.method);

  // Lookup handler
  const handler = (routes as Record<string, Handler>)[key];
  if (!handler) {
    self.postMessage(err(req.id, "E_NOT_FOUND", `Unknown RPC method: ${key}`));
    return;
  }

  // Execute
  try {
    const responseOrRaw = await handler(req);

    // If handler returned a structured RpcResponse (ok/err), pass-through
    if (
      isObject(responseOrRaw) &&
      typeof (responseOrRaw as Record<string, unknown>)["ok"] === "boolean"
    ) {
      self.postMessage(responseOrRaw as RpcResponse);
      return;
    }

    // Otherwise wrap raw value in ok()
    self.postMessage(ok(req.id, responseOrRaw));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    self.postMessage(err(req.id, "E_INTERNAL", message));
  }
};
