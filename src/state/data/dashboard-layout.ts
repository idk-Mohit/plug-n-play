import type {
  DashboardPanel,
  DashboardRecord,
  DashboardTemplateId,
} from "@/core/rpc/data-contract";
import { ChartType } from "@/enums/chart.enums";

const CHART_TYPES = new Set<string>(Object.values(ChartType));

export function buildPanelId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Unique viz scope for table DataSource / filters — one id per panel, not per dataset. */
export function tablePanelVizId(panelId: string): string {
  return `table:${panelId}`;
}

/** Default panel list for new dashboards when `panels` is omitted on stored records. */
export function getDefaultPanelsForTemplate(
  templateId: DashboardTemplateId,
): DashboardPanel[] {
  switch (templateId) {
    case "chart-table":
      return [
        {
          id: "chart-1",
          type: "chart",
          chartType: ChartType.LINE,
          order: 0,
        },
        { id: "table-1", type: "table", order: 1 },
      ];
    case "blank":
    case "analytics":
    case "copy":
    default:
      return [];
  }
}

function resolveTemplateForDefaults(record: DashboardRecord): DashboardTemplateId {
  if (record.templateId === "copy") return "blank";
  return record.templateId;
}

/** Ensures `panels` is present and ordered; migrates legacy records without layout. */
export function normalizeDashboardRecord(record: DashboardRecord): DashboardRecord {
  const panels =
    record.panels ?? getDefaultPanelsForTemplate(resolveTemplateForDefaults(record));
  return {
    ...record,
    panels: [...panels].sort((a, b) => a.order - b.order),
  };
}

export function clonePanelsForCopy(source: DashboardRecord): DashboardPanel[] {
  const normalized = normalizeDashboardRecord(source);
  return normalized.panels!.map((panel, index) => ({
    ...panel,
    id:
      panel.type === "chart"
        ? buildPanelId("chart")
        : buildPanelId("table"),
    order: index,
  }));
}

export function addPanelToDashboard(
  dashboard: DashboardRecord,
  panel: Omit<DashboardPanel, "order"> & { order?: number },
): DashboardRecord {
  const panels = dashboard.panels ?? [];
  const order = panel.order ?? panels.length;
  const now = new Date().toISOString();
  return normalizeDashboardRecord({
    ...dashboard,
    panels: [...panels, { ...panel, order }],
    updatedAt: now,
  });
}

export function removePanelFromDashboard(
  dashboard: DashboardRecord,
  panelId: string,
): DashboardRecord {
  const panels = (dashboard.panels ?? [])
    .filter((p) => p.id !== panelId)
    .map((p, index) => ({ ...p, order: index }));
  const now = new Date().toISOString();
  return normalizeDashboardRecord({
    ...dashboard,
    panels,
    updatedAt: now,
  });
}

export function isValidDashboardPanel(x: unknown): x is DashboardPanel {
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

export const VIZ_CHART_CATALOG = [
  { type: ChartType.LINE, label: "Line" },
  { type: ChartType.AREA, label: "Area" },
  { type: ChartType.SCATTER, label: "Scatter" },
  { type: ChartType.BAR, label: "Bar" },
] as const;
