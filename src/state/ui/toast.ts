import { atom } from "jotai";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastConfig {
  title: string;
  description?: string;
  /** @default "info" */
  variant?: ToastVariant;
  /** ms; `0` = persistent until dismissed. @default 4000 */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

/** Singleton toast; `null` means nothing shown. */
export const toastAtom = atom<ToastConfig | null>(null);
