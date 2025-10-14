// // atoms/view.ts
// import { atomWithStorage } from "jotai/utils";

// export const activeViewAtom = atomWithStorage<
//   | "dashboard"
//   | "datasources"
//   | "visuals"
//   | "activity"
//   | "changelogs"
//   | "dataset"
// >("activeView", "dashboard");

// path: src/atoms/view.ts
import { atomWithStorage } from "jotai/utils";

export type ViewName =
  | "dashboard"
  | "datasources"
  | "visuals"
  | "activity"
  | "changelogs"
  | "dataset";

export interface ViewState {
  view: ViewName;
  meta?: {
    datasetId?: string;
    tab?: string;
    [k: string]: string | number | boolean | undefined;
  };
}

export const activeViewAtom = atomWithStorage<ViewState>("activeView:v2", {
  view: "dashboard",
  meta: undefined,
});
