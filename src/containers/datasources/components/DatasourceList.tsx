import React, { useCallback, useMemo, useState } from "react";
import { Database, Fullscreen } from "lucide-react";
import { activeDatasetAtom, persistedDatasetsAtom } from "@/state/data/dataset";
import { useAtom, useSetAtom } from "jotai";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/table/SimpleTable";
import IconButton from "@/components/IconButton";
import type { AnyRecord, uuid } from "@/types/data.types";
import { dataEngine } from "@/core/data-engine";
import { ScrollArea } from "@/components/ui/scroll-area";
import { safeFormatDate } from "@/core/date.utils";
import { activeViewAtom } from "@/state/ui/view";
import DatasourceItem from "./DatasourceItem";
import {
  DEFAULT_SAMPLE_DATASET_ID,
  isDefaultSampleDatasetId,
} from "@/state/data/defaultSampleDataset";

/**
 * DatasetList
 *
 * Displays a list of datasets with expandable previews, a table view modal,
 * rename dialog, and a delete confirmation alert dialog.
 */
export function DatasourceList() {
  const setView = useSetAtom(activeViewAtom);
  const [datasets, setDatasets] = useAtom(persistedDatasetsAtom);
  const setActiveDataset = useSetAtom(activeDatasetAtom);
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
  const [renameTargetId, setRenameTargetId] = useState<uuid | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

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

  /** Open rename dialog with current name. */
  const askRename = useCallback(
    (id: uuid) => {
      const ds = datasets.find((d) => d.id === id);
      if (!ds) return;
      setRenameTargetId(id);
      setRenameDraft(ds.name);
    },
    [datasets],
  );

  const commitRename = useCallback(() => {
    if (!renameTargetId) return;
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    setDatasets((prev) =>
      prev.map((d) =>
        d.id === renameTargetId ? { ...d, name: trimmed } : d,
      ),
    );
    setActiveDataset((prev) =>
      prev?.id === renameTargetId ? { ...prev, name: trimmed } : prev,
    );
    setRenameTargetId(null);
  }, [
    renameTargetId,
    renameDraft,
    setDatasets,
    setActiveDataset,
  ]);

  /** Perform delete; close dialog on completion. */
  const deleteDataSetHandler = useCallback(
    async (id: uuid) => {
      if (isDefaultSampleDatasetId(id)) {
        setDeleteDataSet(null);
        return;
      }
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
        <h3 className="text-lg font-medium text-foreground">Datasets</h3>

        <ScrollArea className="h-[50dvh] w-full rounded-md border">
          <div className="space-y-3 p-2">
            {datasets.map((dataset) => {
              const isExpanded = expandedDataset === dataset.id;
              return (
                <div key={dataset.id}>
                  <DatasourceItem
                    dataset={dataset}
                    isExpanded={isExpanded}
                    onToggle={() =>
                      setExpandedDataset(isExpanded ? null : dataset.id)
                    }
                    onAskRename={() => askRename(dataset.id)}
                    onAskDelete={() => askDelete(dataset.id)}
                    formatDate={formatDate}
                    onShowGrid={openGrid}
                    allowDelete={dataset.id !== DEFAULT_SAMPLE_DATASET_ID}
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
        <DialogContent className="w-[100vw] min-h-fit max-h-[80vh]">
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
              onClick={() => {
                setView({
                  view: "dataset",
                  meta: {
                    datasetId: expandedDataset ?? undefined,
                    tab: "preview",
                  },
                });
                // location.hash = `#${expandedDataset}`;
              }}
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

      <Dialog
        open={renameTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTargetId(null);
        }}
      >
        <DialogContent className="gap-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold tracking-tight">
              Rename dataset
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-snug">
              Update the display name. The dataset id and stored data are
              unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="dataset-rename" className="text-xs">
              Name
            </Label>
            <Input
              id="dataset-rename"
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename();
                }
              }}
              className="h-8 text-xs"
              autoFocus
              maxLength={120}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRenameTargetId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!renameDraft.trim()}
              onClick={() => commitRename()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
