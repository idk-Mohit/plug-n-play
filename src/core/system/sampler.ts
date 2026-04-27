import { getDefaultStore } from "jotai";

import { getRegisteredDataSources } from "@/core/data-source/registry";
import type { SystemHeapResult } from "@/core/rpc/data-contract";
import { getEngineRpc } from "@/core/rpc/engineSingleton";
import { FpsMeter } from "@/core/system/fpsMeter";
import { createLongTaskObserver } from "@/core/system/longTaskObserver";
import {
  clearSamplesFromIdb,
  loadSamplesFromIdb,
  saveSamplesToIdb,
} from "@/core/system/persist";
import type { SystemSample } from "@/core/system/types";
import {
  liveSampleAtom,
  sampleHistoryAtom,
  SAMPLER_INTERVAL_OPTIONS,
  samplerEnabledAtom,
} from "@/state/system/atoms";

const longTask = createLongTaskObserver();
const fpsMeter = new FpsMeter();

let tickInterval: ReturnType<typeof setInterval> | null = null;
let persistInterval: ReturnType<typeof setInterval> | null = null;
let lastMinimalAt = 0;
let currentIntervalMs = 1000;

export function normalizeSamplerIntervalMs(ms: number): number {
  return (
    SAMPLER_INTERVAL_OPTIONS as readonly number[]
  ).includes(ms)
    ? ms
    : 1000;
}

/**
 * Recreate the tick interval with a new cadence (sampler must already be started).
 */
export function setSamplerInterval(ms: number): void {
  currentIntervalMs = normalizeSamplerIntervalMs(ms);
  if (tickInterval == null) return;
  clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    void tick();
  }, currentIntervalMs);
}

let storageCache: { quota: number; usage: number } | undefined;
let storageCacheAt = 0;
let idbListCache: Array<{ name?: string; version?: number }> | undefined;
let idbListCacheAt = 0;
let lsBytesCache = 0;
let lsBytesCacheAt = 0;

function readMainHeap(): SystemSample["heap"] {
  const perf = performance as Performance & {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };
  if (!perf.memory) return undefined;
  return {
    used: perf.memory.usedJSHeapSize,
    total: perf.memory.totalJSHeapSize,
    limit: perf.memory.jsHeapSizeLimit,
  };
}

function measureLocalStorageBytes(): number {
  let n = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k) ?? "";
      n += k.length + v.length;
    }
  } catch {
    /* ignore */
  }
  return n * 2;
}

async function maybeStorage(
  now: number,
): Promise<SystemSample["storage"] | undefined> {
  if (now - storageCacheAt < 10_000 && storageCache) return storageCache;
  if (!navigator.storage?.estimate) return storageCache;
  try {
    const e = await navigator.storage.estimate();
    storageCache = { quota: e.quota ?? 0, usage: e.usage ?? 0 };
    storageCacheAt = now;
    return storageCache;
  } catch {
    return storageCache;
  }
}

async function maybeIdbList(
  now: number,
): Promise<SystemSample["idbDatabases"] | undefined> {
  if (now - idbListCacheAt < 10_000 && idbListCache) return idbListCache;
  if (typeof indexedDB?.databases !== "function") return idbListCache;
  try {
    idbListCache = await indexedDB.databases();
    idbListCacheAt = now;
    return idbListCache;
  } catch {
    return idbListCache;
  }
}

function maybeLsBytes(now: number): number {
  if (now - lsBytesCacheAt < 10_000) return lsBytesCache;
  lsBytesCache = measureLocalStorageBytes();
  lsBytesCacheAt = now;
  return lsBytesCache;
}

function wasDiscardedDoc(): boolean {
  return (
    "wasDiscarded" in document &&
    Boolean((document as Document & { wasDiscarded?: boolean }).wasDiscarded)
  );
}

async function readWorkerHeap(): Promise<SystemSample["workerHeap"]> {
  const rpc = getEngineRpc();
  try {
    const h = await rpc.call<SystemHeapResult>("System", "heap", [], {
      timeout: 2000,
    });
    // #region agent log
    fetch('http://127.0.0.1:7607/ingest/2d7e6e54-26fe-443a-8f04-dd7367f469d2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3c2b1a' },
      body: JSON.stringify({
        sessionId: '3c2b1a',
        runId: 'memory-bug',
        hypothesisId: 'H4',
        location: 'sampler.ts:readWorkerHeap',
        message: 'worker heap read OK',
        data: h,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (h && "unavailable" in h && h.unavailable) return undefined;
    if (h && "used" in h) {
      return { used: h.used, total: h.total, limit: h.limit };
    }
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7607/ingest/2d7e6e54-26fe-443a-8f04-dd7367f469d2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3c2b1a' },
      body: JSON.stringify({
        sessionId: '3c2b1a',
        runId: 'memory-bug',
        hypothesisId: 'H4',
        location: 'sampler.ts:readWorkerHeap',
        message: 'worker heap read failed (timeout or error)',
        data: { error: e instanceof Error ? e.message : String(e), inflight: getEngineRpc().getInflightCount() },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }
  return undefined;
}

async function takeMinimalSample(now: number): Promise<SystemSample> {
  const rpc = getEngineRpc();
  const workerHeap = await readWorkerHeap();
  return {
    t: now,
    heap: readMainHeap(),
    workerHeap,
    longTaskMs: 0,
    longTaskCount: 0,
    fps: 0,
    rpcInflight: rpc.getInflightCount(),
    rpcLastRttMs: rpc.getLastRttMs(),
    dataSources: getRegisteredDataSources().map((ds) => ds.stats()),
    storage: await maybeStorage(now),
    localStorageBytes: maybeLsBytes(now),
    visibility: document.visibilityState,
    wasDiscarded: wasDiscardedDoc(),
    idbDatabases: await maybeIdbList(now),
  };
}

async function takeFullSample(now: number): Promise<SystemSample> {
  const lt = longTask.drain();
  const rpc = getEngineRpc();
  const workerHeap = await readWorkerHeap();
  return {
    t: now,
    heap: readMainHeap(),
    workerHeap,
    longTaskMs: lt.ms,
    longTaskCount: lt.count,
    fps: fpsMeter.getFps(),
    rpcInflight: rpc.getInflightCount(),
    rpcLastRttMs: rpc.getLastRttMs(),
    dataSources: getRegisteredDataSources().map((ds) => ds.stats()),
    storage: await maybeStorage(now),
    localStorageBytes: maybeLsBytes(now),
    visibility: document.visibilityState,
    wasDiscarded: wasDiscardedDoc(),
    idbDatabases: await maybeIdbList(now),
  };
}

function pushSample(sample: SystemSample): void {
  const store = getDefaultStore();
  store.set(liveSampleAtom, sample);
  store.set(sampleHistoryAtom, (prev) => {
    const next = [...prev, sample];
    return next.length > 300 ? next.slice(-300) : next;
  });
}

async function tick(): Promise<void> {
  const store = getDefaultStore();
  if (!store.get(samplerEnabledAtom)) return;

  const now = Date.now();
  const hidden = document.visibilityState === "hidden";

  if (hidden) {
    if (now - lastMinimalAt < 5000) return;
    lastMinimalAt = now;
    pushSample(await takeMinimalSample(now));
    return;
  }

  lastMinimalAt = 0;
  pushSample(await takeFullSample(now));
}

function onVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    fpsMeter.stop();
  } else {
    fpsMeter.start();
  }
}

export function startSystemSampler(initialMs = 1000): void {
  if (tickInterval != null) return;
  currentIntervalMs = normalizeSamplerIntervalMs(initialMs);
  longTask.start();
  fpsMeter.start();
  tickInterval = setInterval(() => {
    void tick();
  }, currentIntervalMs);

  if (persistInterval == null) {
    persistInterval = setInterval(() => {
      const store = getDefaultStore();
      void saveSamplesToIdb(store.get(sampleHistoryAtom));
    }, 5000);
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
}

export function stopSystemSampler(): void {
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (tickInterval != null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
  if (persistInterval != null) {
    clearInterval(persistInterval);
    persistInterval = null;
  }
  longTask.stop();
  fpsMeter.stop();
}

export async function hydrateHistoryFromIdb(): Promise<void> {
  const samples = await loadSamplesFromIdb();
  const store = getDefaultStore();
  store.set(sampleHistoryAtom, samples);
  const last = samples[samples.length - 1];
  if (last) store.set(liveSampleAtom, last);
}

export async function clearMonitorHistory(): Promise<void> {
  const store = getDefaultStore();
  store.set(sampleHistoryAtom, []);
  store.set(liveSampleAtom, null);
  await clearSamplesFromIdb();
}
