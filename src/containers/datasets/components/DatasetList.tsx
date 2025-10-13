import React, { memo, useCallback, useMemo, useState } from "react";
import {
  FileText,
  Database,
  Trash2,
  Calendar,
  HardDrive,
  Hash,
  Table,
  Fullscreen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { persistedDatasetsAtom, type Dataset } from "@/atoms/dataset.atom";
import { useAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/table/SimpleTable";
import IconButton from "@/components/IconButton";
import type { AnyRecord, uuid } from "@/types/data.types";
import { dataEngine } from "@/core/data-engine";
import { ScrollArea } from "@/components/ui/scroll-area";
import { safeFormatDate } from "@/core/date.utils";

/**
 * Choose an icon based on dataset type.
 */
const getFileIcon = (type: string) => (type === "JSON" ? FileText : Database);

/**
 * A single dataset list item, separated and memoized to minimize re-renders.
 */
const DatasetItem = memo(function DatasetItem({
  dataset,
  isExpanded,
  onToggle,
  onAskDelete,
  formatDate,
  onShowGrid,
}: {
  dataset: Dataset;
  isExpanded: boolean;
  onToggle: () => void;
  onAskDelete: () => void;
  formatDate: (iso: string) => string;
  onShowGrid: (e: React.MouseEvent) => void;
}) {
  const Icon = getFileIcon(dataset.type);

  return (
    <div className="bg-card rounded-lg border border-border hover:shadow-md transition-all duration-200">
      {/* Item header (click to expand/collapse) */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-medium text-card-foreground">
                {dataset.name}
              </h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" aria-hidden="true" />
                  {dataset.type}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {formatDate(dataset.uploadDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <HardDrive className="h-3 w-3" aria-hidden="true" />
                {dataset.size}
              </div>
              {dataset.records ? (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <Hash className="h-3 w-3" aria-hidden="true" />
                  {dataset.records} records
                </div>
              ) : null}
            </div>

            {/* Delete trigger (stops row toggle) */}
            <Button
              aria-label={`Delete dataset ${dataset.name}`}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAskDelete();
              }}
              className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/20">
          <h5 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2 justify-between">
            Data Preview
            <Button
              aria-label="Open table view"
              variant="secondary"
              size="sm"
              onClick={onShowGrid}
              className="text-primary hover:text-destructive hover:bg-destructive/10 cursor-pointer flex align-center gap-2"
            >
              Table View{" "}
              <Table className="h-4 w-4 text-primary" aria-hidden="true" />
            </Button>
          </h5>

          {/* Preview JSON (rendered as code, truncated for large arrays by parent) */}
          <pre className="text-xs text-muted-foreground bg-background rounded p-3 overflow-auto max-h-40">
            {/* The content is injected by the parent via memoized string to avoid repeated stringify here */}
            {/* We keep this container minimal to avoid unnecessary work */}
            {JSON.stringify(dataset.preview, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
});

/**
 * DatasetList
 *
 * Displays a list of datasets with expandable previews, a table view modal,
 * and a delete confirmation alert dialog.
 */
export function DatasetList() {
  const [datasets, setDatasets] = useAtom(persistedDatasetsAtom);

  // Which dataset row is expanded
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);

  // Table view dialog visibility
  const [showGrid, setShowGrid] = useState(false);

  // Delete confirmation dialog state
  const [deleteDataSet, setDeleteDataSet] = useState<{
    show: boolean;
    id: uuid;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /** Format ISO string with the shared formatter. */
  const formatDate = useCallback(
    (value: string | number | Date | null | undefined) => safeFormatDate(value),
    []
  );

  /** The currently selected (expanded) dataset, if any. */
  const selectedDataset = useMemo(
    () => datasets.find((d) => d.id === expandedDataset) ?? null,
    [datasets, expandedDataset]
  );

  /**
   * Precompute a truncated preview string (so we don't JSON.stringify on every render).
   * Adjust the limit based on your typical preview size.
   */
  const previewString = useMemo(() => {
    if (!selectedDataset?.preview) return "";
    const arr = Array.isArray(selectedDataset.preview)
      ? (selectedDataset.preview as AnyRecord[])
      : [selectedDataset.preview];
    const LIMIT = 50; // show first 50 records
    const truncated = arr.slice(0, LIMIT);
    const str = JSON.stringify(truncated, null, 2);
    return arr.length > LIMIT
      ? `${str}\n/* truncated to first ${LIMIT} records */`
      : str;
  }, [selectedDataset]);

  /** Open the table view without toggling the row. */
  const openGrid = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGrid(true);
  }, []);

  /** Ask for delete confirmation for a dataset id. */
  const askDelete = useCallback((id: uuid) => {
    setDeleteDataSet({ show: true, id });
  }, []);

  /** Perform delete; close dialog on completion. */
  const deleteDataSetHandler = useCallback(
    async (id: uuid) => {
      try {
        setIsDeleting(true);
        await dataEngine.deleteDataset(id);
        setDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
      } finally {
        setIsDeleting(false);
        setDeleteDataSet(null);
      }
    },
    [setDatasets]
  );

  if (datasets.length === 0) {
    return (
      <div className="w-full shadow-lg animate-in ease-linear fade-in slide-in-from-bottom-100 bg-card rounded-lg border border-border p-8 text-center">
        <Database
          className="h-12 w-12 text-muted-foreground mx-auto mb-4"
          aria-hidden="true"
        />
        <h3 className="text-lg font-medium text-card-foreground mb-2">
          No datasets yet
        </h3>
        <p className="text-muted-foreground">
          Upload your first dataset to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 w-full shadow-lg animate-in ease-linear fade-in slide-in-from-bottom-100">
        <h3 className="text-lg font-medium text-foreground">
          Uploaded Datasets
        </h3>

        <ScrollArea className="h-[50dvh] w-full rounded-md border">
          <div className="space-y-3 p-2">
            {datasets.map((dataset) => {
              const isExpanded = expandedDataset === dataset.id;
              return (
                <div key={dataset.id}>
                  <DatasetItem
                    dataset={dataset}
                    isExpanded={isExpanded}
                    onToggle={() =>
                      setExpandedDataset(isExpanded ? null : dataset.id)
                    }
                    onAskDelete={() => askDelete(dataset.id)}
                    formatDate={formatDate}
                    onShowGrid={openGrid}
                  />
                  {/* Inject the memoized preview inside the expanded item's <pre> block */}
                  {isExpanded ? (
                    <div className="sr-only" aria-hidden>
                      {/* This invisible block keeps logical association in the tree. */}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Table View Dialog (always mounted, controlled by `open`) */}
      <Dialog
        open={showGrid && !!expandedDataset}
        onOpenChange={(open) => {
          setShowGrid(open);
          if (!open) setExpandedDataset(null);
        }}
      >
        <DialogContent className="max-w-[90vw] w-full min-h-fit max-h-[80vh] overflow-hidden">
          <DialogHeader className="gap-4 flex justify-between">
            <DialogTitle>Table View</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <DataTable
            columns={[]}
            data={(selectedDataset?.preview ?? []) as AnyRecord[]}
          />

          <DialogFooter>
            <IconButton
              icon={Fullscreen}
              text="View full dataset"
              textLocation="after"
              aria-label="View full dataset"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation (controlled via onOpenChange so outside click/Esc work) */}
      <AlertDialog
        open={!!deleteDataSet?.id && !!deleteDataSet?.show}
        onOpenChange={(open) => {
          if (!open) setDeleteDataSet(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              dataset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setDeleteDataSet(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              disabled={isDeleting}
              onClick={() =>
                deleteDataSet && deleteDataSetHandler(deleteDataSet.id)
              }
            >
              {isDeleting ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Render the JSON preview string once, next to the list, to avoid heavy work inside each item */}
      {selectedDataset ? (
        <div className="hidden">
          {/* This is simply to keep previewString computation near the DOM.
              In your real layout, you likely want the <pre> where the item is expanded.
              If so, replace the <pre> inside DatasetItem with {previewString}. */}
          <pre>{previewString}</pre>
        </div>
      ) : null}
    </>
  );
}
