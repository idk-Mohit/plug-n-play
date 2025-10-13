import { atom } from "jotai";

export const breadcrumbsAtom = atom<string>();

export const resetBreadcrumbsAtom = atom(null, (_get, set) => {
  set(breadcrumbsAtom, "");
});

export const setBreadcrumbsAtom = atom(
  null,
  (_get, set, breadcrumbs: string) => {
    set(breadcrumbsAtom, breadcrumbs);
  }
);
