import type { DashboardRecord, DashboardTemplateId } from "@/core/rpc/data-contract";

import { isCopyTemplate } from "./dashboard-templates";

export const DEFAULT_DASHBOARD_ID = "dashboard-main";

/** Stable seed dashboard created on first run and when the manifest is empty. */
export function createDefaultMainDashboard(): DashboardRecord {
  const now = new Date().toISOString();
  return {
    id: DEFAULT_DASHBOARD_ID,
    name: "Main",
    templateId: "chart-table",
    createdAt: now,
    updatedAt: now,
  };
}

/** User input for {@link buildDashboardRecord}; `copiedFromId` required when `templateId` is `copy`. */
export type CreateDashboardInput = {
  name: string;
  templateId: DashboardTemplateId;
  copiedFromId?: string;
};

export function nextDashboardName(existing: DashboardRecord[]): string {
  const n = existing.length + 1;
  return `Dashboard ${n}`;
}

/** Builds a new record; copy template clones metadata only (layout wiring is Phase 1b). */
export function buildDashboardRecord(
  input: CreateDashboardInput,
  source?: DashboardRecord,
): DashboardRecord {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const trimmed = input.name.trim();

  if (isCopyTemplate(input.templateId) && source) {
    return {
      id,
      name: trimmed || `Copy of ${source.name}`,
      templateId: source.templateId === "copy" ? "blank" : source.templateId,
      copiedFromId: source.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  if (!trimmed) {
    throw new Error("Dashboard name is required");
  }

  return {
    id,
    name: trimmed,
    templateId: isCopyTemplate(input.templateId) ? "blank" : input.templateId,
    createdAt: now,
    updatedAt: now,
  };
}

export function appendDashboard(
  dashboards: DashboardRecord[],
  record: DashboardRecord,
): DashboardRecord[] {
  return [...dashboards, record];
}

export function findDashboardById(
  dashboards: DashboardRecord[],
  id: string,
): DashboardRecord | undefined {
  return dashboards.find((d) => d.id === id);
}

/** Resolves the active record, falling back to the first list entry when the id is missing or stale. */
export function resolveActiveDashboard(
  dashboards: DashboardRecord[],
  activeId: string | null,
): DashboardRecord | null {
  if (dashboards.length === 0) return null;
  if (activeId) {
    const found = findDashboardById(dashboards, activeId);
    if (found) return found;
  }
  return dashboards[0] ?? null;
}
