import type { DashboardRecord, DashboardTemplateId } from "./data-contract";

const DASHBOARD_TEMPLATE_IDS = new Set<DashboardTemplateId>([
  "blank",
  "chart-table",
  "analytics",
  "copy",
]);

/** Runtime guard for worker + storage boundaries. */
export function isValidDashboardRecord(x: unknown): x is DashboardRecord {
  if (x === null || typeof x !== "object" || Array.isArray(x)) return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.name === "string" &&
    r.name.length > 0 &&
    typeof r.templateId === "string" &&
    DASHBOARD_TEMPLATE_IDS.has(r.templateId as DashboardTemplateId) &&
    typeof r.createdAt === "string" &&
    typeof r.updatedAt === "string" &&
    (r.copiedFromId === undefined || typeof r.copiedFromId === "string")
  );
}

/** Parses and validates a manifest array; drops invalid entries. */
export function parseDashboardManifest(raw: unknown): DashboardRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidDashboardRecord);
}

/** True when every element is a valid {@link DashboardRecord}. */
export function isDashboardManifest(raw: unknown): raw is DashboardRecord[] {
  return Array.isArray(raw) && raw.every(isValidDashboardRecord);
}
