import { atom } from "jotai";

/** Server release version currently advertised by the update banner. */
export interface UpdateBannerState {
  serverVersion: number;
}

/** Active update banner payload; `null` means hidden. */
export const updateBannerAtom = atom<UpdateBannerState | null>(null);
