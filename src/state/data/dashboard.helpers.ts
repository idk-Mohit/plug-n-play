import type { DashboardRecord, DashboardTemplateId } from "@/core/rpc/data-contract";

import { isCopyTemplate } from "./dashboard-templates";
import {
  clonePanelsForCopy,
  getDefaultPanelsForTemplate,
  normalizeDashboardRecord,
} from "./dashboard-layout";

export const DEFAULT_DASHBOARD_ID = "dashboard-main";

/** Stable seed dashboard created on first run and when the manifest is empty. */
export function createDefaultMainDashboard(): DashboardRecord {
  const now = new Date().toISOString();
  return normalizeDashboardRecord({
    id: DEFAULT_DASHBOARD_ID,
    name: "Main",
    templateId: "chart-table",
    createdAt: now,
    updatedAt: now,
  });
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
    return normalizeDashboardRecord({
      id,
      name: trimmed || `Copy of ${source.name}`,
      templateId: source.templateId === "copy" ? "blank" : source.templateId,
      copiedFromId: source.id,
      panels: clonePanelsForCopy(source),
      createdAt: now,
      updatedAt: now,
    });
  }

  if (!trimmed) {
    throw new Error("Dashboard name is required");
  }

  const templateId = isCopyTemplate(input.templateId) ? "blank" : input.templateId;

  return normalizeDashboardRecord({
    id,
    name: trimmed,
    templateId,
    panels: getDefaultPanelsForTemplate(templateId),
    createdAt: now,
    updatedAt: now,
  });
}

export function updateDashboardRecord(
  dashboards: DashboardRecord[],
  id: string,
  patch: Partial<Pick<DashboardRecord, "name" | "panels">>,
): DashboardRecord[] {
  const now = new Date().toISOString();
  return dashboards.map((d) =>
    d.id === id
      ? normalizeDashboardRecord({ ...d, ...patch, updatedAt: now })
      : d,
  );
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
    if (found) return normalizeDashboardRecord(found);
  }
  const fallback = dashboards[0];
  return fallback ? normalizeDashboardRecord(fallback) : null;
}
