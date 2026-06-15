import { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { ChevronUp, Database, X } from "lucide-react";
import { timeFormat } from "d3-time-format";

import { Button } from "@/components/ui/button";
import { persistedDatasetsAtom } from "@/state/data/dataset";
import { activeViewAtom } from "@/state/ui/view";
import { footerDrawerOpenAtom } from "@/state/ui/layout";
import { useDatasetLiveRowCount } from "@/hooks/useDatasetLiveRowCount";
import { cn } from "@/lib/utils";

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}

/**
 * Bottom panel for the dataset detail view — metadata and navigation.
 */
export function DatasetInfoDrawer() {
  const [open, setOpen] = useAtom(footerDrawerOpenAtom);
  const activeView = useAtomValue(activeViewAtom);
  const persistedDatasets = useAtomValue(persistedDatasetsAtom);
  const [expanded, setExpanded] = useState(false);

  const datasetId = activeView.meta?.datasetId ?? null;

  const meta = useMemo(
    () =>
      datasetId
        ? persistedDatasets.find((d) => d.id === datasetId)
        : undefined,
    [datasetId, persistedDatasets],
  );

  const liveRowCount = useDatasetLiveRowCount(datasetId);
  const displayRecords = meta?.records ?? liveRowCount ?? null;

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

  if (!open) return null;

  const formatLocalTime = timeFormat("%B %d, %Y %I:%M %p");
  const uploadLabel =
    meta?.uploadDate && !Number.isNaN(new Date(meta.uploadDate).getTime())
      ? formatLocalTime(new Date(meta.uploadDate))
      : "—";

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-40 bg-black/40 transition-opacity animate-in fade-in duration-200"
        aria-label="Close dataset info"
        onClick={() => setOpen(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dataset-info-title"
        aria-describedby="dataset-info-description"
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
              ? "Collapse dataset info to default height"
              : "Expand dataset info to full height"
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
            <Database className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="dataset-info-title"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              {meta?.name ?? "Dataset info"}
            </h2>
            <p
              id="dataset-info-description"
              className="text-[11px] leading-tight text-muted-foreground"
            >
              Metadata for the dataset you are previewing.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close dataset info"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 basis-0 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-4 px-4 pb-4 pt-3 lg:px-5">
            {meta || datasetId ? (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-muted/15 p-3 shadow-sm sm:grid-cols-3">
                <MetaRow
                  label="Records"
                  value={
                    displayRecords != null
                      ? displayRecords.toLocaleString()
                      : "—"
                  }
                />
                <MetaRow
                  label="Type"
                  value={meta?.type?.toUpperCase() ?? "—"}
                />
                <MetaRow label="Size" value={meta?.size || "—"} />
                <MetaRow label="Uploaded" value={uploadLabel} />
                <MetaRow
                  label="ID"
                  value={
                    <span className="font-mono text-[10px] break-all">
                      {datasetId ?? "—"}
                    </span>
                  }
                />
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No dataset selected. Open a dataset from Datasources to see
                details here.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
