// atoms/view.ts
import { atom } from "jotai";

export const activeViewAtom = atom<
  "dashboard" | "datasets" | "visuals" | "activity"
>("dashboard");
