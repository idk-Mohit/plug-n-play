import type {
  DashboardPanel,
  DashboardRecord,
  DashboardTemplateId,
} from "./data-contract";
import { ChartType } from "@/enums/chart.enums";

const DASHBOARD_TEMPLATE_IDS = new Set<DashboardTemplateId>([
  "blank",
  "chart-table",
  "analytics",
  "copy",
]);

const CHART_TYPES = new Set<string>(Object.values(ChartType));

function isValidDashboardPanel(x: unknown): x is DashboardPanel {
  if (x === null || typeof x !== "object" || Array.isArray(x)) return false;
  const p = x as Record<string, unknown>;
  if (typeof p.id !== "string" || p.id.length === 0) return false;
  if (p.type !== "chart" && p.type !== "table") return false;
  if (typeof p.order !== "number" || !Number.isFinite(p.order)) return false;
  if (p.chartType !== undefined) {
    if (typeof p.chartType !== "string" || !CHART_TYPES.has(p.chartType)) {
      return false;
    }
  }
  return true;
}

function isValidPanelsField(panels: unknown): panels is DashboardPanel[] {
  return Array.isArray(panels) && panels.every(isValidDashboardPanel);
}

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
    (r.copiedFromId === undefined || typeof r.copiedFromId === "string") &&
    (r.panels === undefined || isValidPanelsField(r.panels))
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
