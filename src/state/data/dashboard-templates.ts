import type { DashboardTemplateId } from "@/core/rpc/data-contract";

export type DashboardTemplateOption = {
  id: DashboardTemplateId;
  label: string;
  description: string;
};

/** Predefined starters; layout wiring lands in Phase 1b. */
export const PREDEFINED_DASHBOARD_TEMPLATES: DashboardTemplateOption[] = [
  {
    id: "blank",
    label: "Blank",
    description: "An empty dashboard to start from scratch.",
  },
  {
    id: "chart-table",
    label: "Chart + table",
    description: "Chart on top, data table below — the current Home layout.",
  },
  {
    id: "analytics",
    label: "Analytics starter",
    description: "KPI tiles and a chart row for at-a-glance metrics.",
  },
];

export const COPY_DASHBOARD_TEMPLATE: DashboardTemplateOption = {
  id: "copy",
  label: "Copy existing",
  description: "Duplicate a dashboard you already have.",
};

export function isCopyTemplate(id: DashboardTemplateId): boolean {
  return id === "copy";
}
