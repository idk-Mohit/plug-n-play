import { V, type RpcRequest } from "@/core/rpc/config/protocol";
import { ok, err } from "@/engine/rpcResponse";
import * as dataService from "@/engine/services/data.service";
import * as systemService from "@/engine/services/system.service";

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

// ---- Handlers ----
// Each handler gets a validated RpcRequest and must return a response.

const routes: Record<string, (req: RpcRequest) => Promise<unknown>> = {
  "System.ping": async (req: RpcRequest) => {
    return ok(req.id, { pong: true, t: Date.now() });
  },
  "System.pong": async (req: RpcRequest) => {
    return ok(req.id, { ping: true, t: Date.now() });
  },
  "System.heap": systemService.getHeap,
  "System.stats": systemService.getStats,
  "Data.getMeta": dataService.getMeta,
  "Data.getPreview": dataService.getPreview,
  "Data.getRange": dataService.getRange,
  "Data.getPage": dataService.getPage,
  "Data.getAggregated": dataService.getAggregated,
  "Data.save": dataService.save,
  "Data.deleteDataset": dataService.deleteDataset,
  "Data.getManifest": dataService.getManifest,
  "Data.saveManifest": dataService.saveManifest,
  "Data.listDatasetKeys": dataService.listDatasetKeys,
  "Data.clearAll": dataService.clearAll,
};

// ---- Validation helpers ----

/**
 * Validate that a payload looks like an RPC request.
 * Returns an object with { valid: boolean, reason?: string }.
 */
function validateEnvelope(payload: unknown): {
  valid: boolean;
  reason?: string;
} {
  if (typeof payload !== "object" || payload === null) {
    return { valid: false, reason: "payload is not an object" };
  }

  const p = payload as Record<string, unknown>;
  const { v, id, svc, method, args } = p;

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

function routeKey(svc: string, method: string): string {
  return `${svc}.${method}`;
}

// ---- Worker message handler ----

self.onmessage = async (ev: MessageEvent) => {
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

  const p = payload as Record<string, unknown>;
  const req: RpcRequest = {
    v: V,
    id: msgId,
    svc: String(p.svc),
    method: String(p.method),
    args: Array.isArray(p.args) ? p.args : [],
  };

  const key = routeKey(req.svc, req.method);
  systemService.bumpRouteHit(key);
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
    const r = res as { ok?: unknown };
    if (!res || typeof res !== "object" || typeof r.ok !== "boolean") {
      self.postMessage(ok(req.id, res));
      return;
    }

    self.postMessage(res);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    systemService.recordWorkerRouteError(message);
    self.postMessage(err(req.id, "E_INTERNAL", message));
  }
};
