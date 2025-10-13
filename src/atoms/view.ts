// atoms/view.ts
import { atomWithStorage } from "jotai/utils";

export const activeViewAtom = atomWithStorage<
  "dashboard" | "datasets" | "visuals" | "activity"
>("activeView", "dashboard");
