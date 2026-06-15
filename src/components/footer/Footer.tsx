import { Separator } from "@/components/ui/separator";
import { PanelBottomClose, PanelBottomOpen } from "lucide-react";
import IconButton from "../IconButton";
import { Combobox } from "../ui/combobox";
import { useCallback, useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { computeHealth } from "@/core/system/health";
import { cn } from "@/lib/utils";
import {
  activityWidgetOpenAtom,
  liveSampleAtom,
  samplerEnabledAtom,
} from "@/state/system/atoms";
import {
  activeDatasetAtom,
  type DatasetMeta,
} from "@/state/data/dataset";
import type { DatasetRef } from "@/core/rpc/controllers/datasources";
import { useDatasetOptions } from "@/hooks/useDatasetOptions";
import { activeViewAtom } from "@/state/ui/view";
import { dashboardDrawerOpenAtom } from "@/state/ui/layout";
import { dataEngine } from "@/core/data-engine";
import type { uuid } from "@/types/data.types";
import { FooterRowCount, UploadDate } from "./FooterAtoms";

export function SiteFooter() {
  const activeView = useAtomValue(activeViewAtom);
  const [activeDatasetRef, setActiveDatasetRef] = useAtom(activeDatasetAtom);
  const datasetOptions = useDatasetOptions();
  const [drawerOpen, setDrawerOpen] = useAtom(dashboardDrawerOpenAtom);
  const samplerOn = useAtomValue(samplerEnabledAtom);
  const live = useAtomValue(liveSampleAtom);
  const [widgetOpen, setWidgetOpen] = useAtom(activityWidgetOpenAtom);
  const health = computeHealth(live);

  useEffect(() => {
    if (activeView.view === "activity") {
      setWidgetOpen(false);
    }
  }, [activeView.view, setWidgetOpen]);

  const showActivityPill =
    samplerOn && activeView.view !== "activity";

  const [activeDataSetMeta, setActiveDataSetMeta] =
    useState<DatasetMeta | null>(null);

  const getActiveDataSet = useCallback(
    (id: uuid) => {
      const activeDataSetMetaResponse = dataEngine.getDatasetMetaById(id);
      setActiveDataSetMeta(activeDataSetMetaResponse);
    },
    [],
  );

  useEffect(() => {
    if (activeView.view === "dashboard" && activeDatasetRef) {
      getActiveDataSet(activeDatasetRef.id);
      return;
    }
    setActiveDataSetMeta(null);
  }, [activeView.view, getActiveDataSet, activeDatasetRef]);

  const handleDatasetChange = (dataset: DatasetRef | null) => {
    if (!dataset) return;
    setActiveDatasetRef(dataset);
    getActiveDataSet(dataset.id);
  };

  const onDashboard = activeView.view === "dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-t transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <IconButton
          icon={drawerOpen ? PanelBottomClose : PanelBottomOpen}
          variant="ghost"
          aria-expanded={drawerOpen}
          aria-label={
            drawerOpen
              ? "Close dashboard settings drawer"
              : "Open dashboard settings drawer"
          }
          onClick={() => setDrawerOpen((open) => !open)}
        />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {onDashboard ? (
          activeDatasetRef ? (
            <>
              <FooterRowCount rowCount={activeDataSetMeta?.records} />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              <UploadDate date={activeDataSetMeta?.uploadDate} />
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Rows: —</span>
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              <span className="text-muted-foreground">Upload Date: —</span>
            </>
          )
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {showActivityPill ? (
            <button
              type="button"
              className={cn(
                "activity-footer-pill inline-flex max-w-[14rem] items-center gap-2 truncate rounded-full border bg-muted/60 px-3 py-1 text-xs font-mono transition-transform hover:scale-[1.03]",
                health === "bad" && "activity-footer-pill--bad",
              )}
              data-alert={health === "bad" ? "bad" : undefined}
              aria-expanded={widgetOpen}
              aria-label={
                widgetOpen
                  ? "Close activity monitor panel"
                  : "Open activity monitor panel"
              }
              onClick={() => setWidgetOpen((o) => !o)}
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  health === "ok" && "bg-emerald-500",
                  health === "warn" && "bg-amber-500",
                  health === "bad" && "bg-red-500",
                )}
              />
              <span className="truncate">
                {live?.fps != null ? `${live.fps.toFixed(0)} fps` : "— fps"}
                <span aria-hidden className="px-1">
                  ·
                </span>
                {live?.heap?.used != null
                  ? `${(live.heap.used / 1024 / 1024).toFixed(0)} MiB`
                  : "— MiB"}
              </span>
            </button>
          ) : null}
          {onDashboard ? (
            <Combobox
              options={datasetOptions}
              getOptionLabel={(s) => s.name}
              getOptionValue={(s) => s.id}
              placeholder="Pick a dataset"
              value={activeDatasetRef}
              triggerWidthClass="w-64"
              onValueChange={handleDatasetChange}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
