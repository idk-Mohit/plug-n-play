import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { SystemSample } from "@/core/system/types";

/** Allowed sampler tick intervals (ms). */
export const SAMPLER_INTERVAL_OPTIONS = [1000, 5000, 10000, 30000] as const;
export type SamplerIntervalMs = (typeof SAMPLER_INTERVAL_OPTIONS)[number];

/**
 * When false, `tick` skips sampling (Activity pause).
 * Persisted so refresh keeps the user’s choice.
 */
export const samplerEnabledAtom = atomWithStorage<boolean>(
  "activity:samplerEnabled",
  true,
);

export const liveSampleAtom = atom<SystemSample | null>(null);

/** Ring buffer (max 300) mirrored to IndexedDB every ~5s. */
export const sampleHistoryAtom = atom<SystemSample[]>([]);

/** Persisted main-thread sampler interval. */
export const samplerIntervalMsAtom = atomWithStorage<number>(
  "activity:intervalMs",
  1000,
);

/**
 * Floating Activity mini panel open/closed.
 * Persisted so refresh keeps the panel state (when not on the full Activity view).
 */
export const activityWidgetOpenAtom = atomWithStorage<boolean>(
  "activity:widgetOpen",
  false,
);

/**
 * When true, the Activity mini panel ignores outside clicks; only explicit hide
 * (or full-page navigation) closes it. Persisted so the preference survives reloads.
 */
export const activityMiniPanelPinnedAtom = atomWithStorage<boolean>(
  "activity:miniPanelPinned",
  false,
);
