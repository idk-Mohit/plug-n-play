import { atom } from "jotai";

export type DialogVariant = "info" | "confirm" | "destructive";

export interface DialogButtonConfig {
  label: string;
  variant?: "default" | "destructive" | "outline" | "ghost";
  onClick: () => void | Promise<void>;
}

export interface ConfirmDialogConfig {
  /** Affects icon + accent. @default "confirm" */
  variant?: DialogVariant;
  title: string;
  /** 11px muted, below title */
  subheading?: string;
  /** 13px body */
  description?: string;
  /** 11px muted, bordered aside */
  note?: string;
  primaryButton?: DialogButtonConfig;
  secondaryButton?: DialogButtonConfig;
  /** ESC / overlay closes. @default true */
  dismissible?: boolean;
}

/** Singleton confirm dialog; `null` means closed. */
export const confirmDialogAtom = atom<ConfirmDialogConfig | null>(null);
