import { V, type RpcCancelEnvelope, type RpcRequest } from "@/core/rpc/config/protocol";
import { ok, err } from "@/engine/rpcResponse";
import * as dataService from "@/engine/services/data.service";
import * as systemService from "@/engine/services/system.service";
import { workerTaskQueue } from "@/engine/task-queue";

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
  "Data.executeQuery": dataService.executeQuery,
  "Data.save": dataService.save,
  "Data.deleteDataset": dataService.deleteDataset,
  "Data.getManifest": dataService.getManifest,
  "Data.saveManifest": dataService.saveManifest,
  "Data.getDashboardManifest": dataService.getDashboardManifest,
  "Data.saveDashboardManifest": dataService.saveDashboardManifest,
  "Data.listDatasetKeys": dataService.listDatasetKeys,
  "Data.clearAll": dataService.clearAll,
};

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

const abortControllers = new Map<string, AbortController>();

function isCancelEnvelope(x: unknown): x is RpcCancelEnvelope {
  if (typeof x !== "object" || x === null) return false;
  const p = x as Record<string, unknown>;
  return p.cancel === true && typeof p.id === "string" && p.v === V;
}

function priorityForRoute(key: string): "high" | "normal" | "low" {
  if (
    key === "Data.getAggregated" ||
    key === "Data.getPage" ||
    key === "Data.getRange" ||
    key === "Data.executeQuery" ||
    key === "Data.getMeta" ||
    key === "Data.save"
  ) {
    return "high";
  }
  if (
    key === "Data.getPreview" ||
    key === "Data.getManifest" ||
    key === "Data.listDatasetKeys" ||
    key === "Data.getDashboardManifest" ||
    key === "Data.saveManifest" ||
    key === "Data.saveDashboardManifest"
  ) {
    return "normal";
  }
  return "low";
}

/** Dashboard hot path — skip queue to avoid slot starvation from timed-out RPCs. */
function shouldBypassTaskQueue(key: string): boolean {
  return (
    key === "Data.getMeta" ||
    key === "Data.getPage" ||
    key === "Data.getPreview"
  );
}

self.onmessage = async (ev: MessageEvent) => {
  const payload = ev.data;

  if (isCancelEnvelope(payload)) {
    abortControllers.get(payload.id)?.abort();
    abortControllers.delete(payload.id);
    return;
  }

  const msgId =
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.id === "string"
      ? payload.id
      : crypto.randomUUID();

  const { valid, reason } = validateEnvelope(payload);
  if (!valid) {
    self.postMessage(
      err(msgId, "E_BAD_REQUEST", `Invalid RPC envelope: ${reason}`),
    );
    return;
  }

  const p = payload as Record<string, unknown>;
  const ac = new AbortController();
  abortControllers.set(msgId, ac);

  const req: RpcRequest = {
    v: V,
    id: msgId,
    svc: String(p.svc),
    method: String(p.method),
    args: Array.isArray(p.args) ? p.args : [],
    signal: ac.signal,
  };

  const key = routeKey(req.svc, req.method);
  systemService.bumpRouteHit(key);
  const handler = routes[key];

  if (!handler) {
    abortControllers.delete(msgId);
    self.postMessage(err(req.id, "E_NOT_FOUND", `Unknown RPC method: ${key}`));
    return;
  }

  const queueKey = `${key}:${req.id}`;

  try {
    const res = shouldBypassTaskQueue(key)
      ? await handler(req)
      : await workerTaskQueue.enqueue(
          queueKey,
          priorityForRoute(key),
          Date.now(),
          () => handler(req),
        );

    const r = res as { ok?: unknown };
    if (!res || typeof res !== "object" || typeof r.ok !== "boolean") {
      self.postMessage(ok(req.id, res));
      return;
    }

    self.postMessage(res);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return;
    }
    if (e instanceof Error && e.name === "AbortError") {
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    systemService.recordWorkerRouteError(message);
    self.postMessage(err(req.id, "E_INTERNAL", message));
  } finally {
    abortControllers.delete(msgId);
  }
};
