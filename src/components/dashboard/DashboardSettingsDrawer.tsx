import { useCallback, useEffect, useState } from "react";
import { useAtom, useAtomValue, useStore } from "jotai";
import {
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  SlidersHorizontal,
  Table2,
  Trash2,
  X,
} from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { DashboardPanel } from "@/core/rpc/data-contract";
import type { ChartType } from "@/enums/chart.enums";
import {
  activeDatasetAtom,
} from "@/state/data/dataset";
import {
  activeDashboardIdAtom,
  persistedDashboardsAtom,
  resolveActiveDashboard,
  updateDashboardRecord,
} from "@/state/data/dashboard";
import {
  addPanelToDashboard,
  buildPanelId,
  removePanelFromDashboard,
  VIZ_CHART_CATALOG,
} from "@/state/data/dashboard-layout";
import { dashboardDrawerOpenAtom } from "@/state/ui/layout";
import { chartSettingsAtomFamily } from "@/state/ui/chart-setting";
import { useDatasetOptions } from "@/hooks/useDatasetOptions";
import { VizTypeGallery } from "@/components/dashboard/VizTypeGallery";
import { cn } from "@/lib/utils";

function panelLabel(panel: DashboardPanel): string {
  if (panel.type === "table") return "Data table";
  const match = VIZ_CHART_CATALOG.find((c) => c.type === panel.chartType);
  return match ? `${match.label} chart` : "Chart";
}

/**
 * In-app bottom settings panel scoped to the main column (SidebarInset).
 * Sits above the footer bar — not a full-viewport modal — so the shell
 * feels like GitBook-style app chrome rather than a site overlay.
 */
export function DashboardSettingsDrawer() {
  const store = useStore();
  const [open, setOpen] = useAtom(dashboardDrawerOpenAtom);
  const [dashboards, setDashboards] = useAtom(persistedDashboardsAtom);
  const activeDashboardId = useAtomValue(activeDashboardIdAtom);
  const activeDashboard = resolveActiveDashboard(
    dashboards,
    activeDashboardId,
  );
  const datasetOptions = useDatasetOptions();
  const [activeDatasetRef, setActiveDatasetRef] = useAtom(activeDatasetAtom);
  const [renameDraft, setRenameDraft] = useState(activeDashboard?.name ?? "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setRenameDraft(activeDashboard?.name ?? "");
  }, [activeDashboard?.id, activeDashboard?.name]);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const commitRename = useCallback(() => {
    if (!activeDashboard) return;
    const trimmed = renameDraft.trim();
    if (!trimmed || trimmed === activeDashboard.name) return;
    const dashboardId = activeDashboard.id;
    setDashboards((prev) =>
      updateDashboardRecord(prev, dashboardId, { name: trimmed }),
    );
  }, [activeDashboard, renameDraft, setDashboards]);

  const handleAddChart = useCallback(
    (chartType: ChartType) => {
      if (!activeDashboardId) return;
      const id = buildPanelId("chart");
      setDashboards((prev) => {
        const active = resolveActiveDashboard(prev, activeDashboardId);
        if (!active) return prev;
        const next = addPanelToDashboard(active, {
          id,
          type: "chart",
          chartType,
        });
        return updateDashboardRecord(prev, active.id, {
          panels: next.panels,
        });
      });
      store.set(chartSettingsAtomFamily(id), (prev) => ({
        ...prev,
        id,
        type: chartType,
        title: `${VIZ_CHART_CATALOG.find((c) => c.type === chartType)?.label ?? "Chart"}`,
      }));
    },
    [activeDashboardId, setDashboards, store],
  );

  const handleAddTable = useCallback(() => {
    if (!activeDashboardId) return;
    setDashboards((prev) => {
      const active = resolveActiveDashboard(prev, activeDashboardId);
      if (!active) return prev;
      const id = buildPanelId("table");
      const next = addPanelToDashboard(active, {
        id,
        type: "table",
      });
      return updateDashboardRecord(prev, active.id, {
        panels: next.panels,
      });
    });
  }, [activeDashboardId, setDashboards]);

  const handleRemovePanel = useCallback(
    (panelId: string) => {
      if (!activeDashboardId) return;
      setDashboards((prev) => {
        const active = resolveActiveDashboard(prev, activeDashboardId);
        if (!active) return prev;
        const next = removePanelFromDashboard(active, panelId);
        return updateDashboardRecord(prev, active.id, {
          panels: next.panels,
        });
      });
    },
    [activeDashboardId, setDashboards],
  );

  const panels = activeDashboard?.panels ?? [];

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-40 bg-black/40 transition-opacity animate-in fade-in duration-200"
        aria-label="Close dashboard settings"
        onClick={() => setOpen(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-settings-title"
        aria-describedby="dashboard-settings-description"
        className={cn(
          "absolute inset-x-3 bottom-0 z-50 flex min-h-0 flex-col overflow-hidden md:inset-x-4 lg:inset-x-6",
          "rounded-t-xl border border-border/80 bg-background/95 shadow-2xl",
          "backdrop-blur-sm supports-[backdrop-filter]:bg-background/90",
          "animate-in slide-in-from-bottom-4 fade-in duration-300 ease-out",
          expanded
            ? "top-0 bottom-0"
            : "h-[min(70vh,32rem)] max-h-[min(70vh,32rem)]",
        )}
      >
        <button
          type="button"
          className="group/handle relative mx-auto mt-2 flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-expanded={expanded}
          aria-label={
            expanded
              ? "Collapse dashboard settings to default height"
              : "Expand dashboard settings to full height"
          }
          onClick={() => setExpanded((value) => !value)}
        >
          <span
            className="h-1 w-10 rounded-full bg-muted transition-opacity duration-200 group-hover/handle:opacity-0 group-focus-visible/handle:opacity-0"
            aria-hidden
          />
          <ChevronUp
            className={cn(
              "pointer-events-none absolute size-4 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 group-hover/handle:opacity-100 group-focus-visible/handle:opacity-100",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <header className="flex shrink-0 items-start gap-2.5 border-b border-border/70 px-4 py-3 lg:px-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            <LayoutDashboard className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="dashboard-settings-title"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              {activeDashboard?.name ?? "Dashboard settings"}
            </h2>
            <p
              id="dashboard-settings-description"
              className="text-[11px] leading-tight text-muted-foreground"
            >
              Rename, pick a dataset, and manage visualizations.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close dashboard settings"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 basis-0 overflow-y-auto overscroll-contain">
            <div className="flex flex-col gap-3 px-4 pb-4 pt-1 lg:px-5">
            <Collapsible
              defaultOpen
              className="rounded-lg border border-border/70 bg-muted/15 shadow-sm"
            >
              <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/40">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  General
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-border/40 bg-background/40 px-3 pb-3 pt-2.5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dashboard-rename" className="text-xs">
                    Dashboard name
                  </Label>
                  <Input
                    id="dashboard-rename"
                    className="h-8 text-xs"
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitRename();
                      }
                    }}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              defaultOpen
              className="rounded-lg border border-border/70 bg-muted/15 shadow-sm"
            >
              <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/40">
                <Table2 className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Data
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-border/40 bg-background/40 px-3 pb-3 pt-2.5">
                <Combobox
                  options={datasetOptions}
                  getOptionLabel={(s) => s.name}
                  getOptionValue={(s) => s.id}
                  placeholder="Pick a dataset"
                  value={activeDatasetRef}
                  triggerWidthClass="w-full"
                  onValueChange={(dataset) => {
                    if (dataset) setActiveDatasetRef(dataset);
                  }}
                />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              defaultOpen
              className="rounded-lg border border-border/70 bg-muted/15 shadow-sm"
            >
              <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/40">
                <LayoutDashboard className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Visualizations
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-3 border-t border-border/40 bg-background/40 px-3 pb-3 pt-2.5">
                {panels.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {panels.map((panel) => (
                      <li
                        key={panel.id}
                        className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-2.5 py-2"
                      >
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                          {panelLabel(panel)}
                        </span>
                        <span className="truncate text-[10px] text-muted-foreground">
                          {panel.id}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove ${panelLabel(panel)}`}
                          onClick={() => handleRemovePanel(panel.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    No visualizations yet. Add a chart or table below.
                  </p>
                )}
                <Separator />
                <VizTypeGallery
                  onAddChart={handleAddChart}
                  onAddTable={handleAddTable}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </section>
    </>
  );
}
