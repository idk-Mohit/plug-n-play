import type { ViewName } from "@/state/ui/view";

export const VIEW_NAMES = [
  "dashboard",
  "datasources",
  "visuals",
  "activity",
  "changelogs",
  "dataset",
] as const satisfies readonly ViewName[];

export function isViewName(value: string): value is ViewName {
  return (VIEW_NAMES as readonly string[]).includes(value);
}
