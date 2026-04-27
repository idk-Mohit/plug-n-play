import { idbDelete, idbGet, idbSave } from "@/core/storage/indexdb";
import type { SystemSample } from "@/core/system/types";

const KEY = "system:samples";
const MAX = 300;

type Stored = { v: number; samples: SystemSample[]; updatedAt: number };

export async function loadSamplesFromIdb(): Promise<SystemSample[]> {
  const raw = await idbGet<Stored>(KEY);
  return Array.isArray(raw?.samples) ? raw.samples : [];
}

export async function saveSamplesToIdb(samples: SystemSample[]): Promise<void> {
  const trimmed = samples.slice(-MAX);
  await idbSave(KEY, {
    v: 1,
    samples: trimmed,
    updatedAt: Date.now(),
  } satisfies Stored);
}

export async function clearSamplesFromIdb(): Promise<void> {
  await idbDelete(KEY);
}
