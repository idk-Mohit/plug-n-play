import React, { memo } from "react";
import {
  FileText,
  Database,
  Trash2,
  Calendar,
  HardDrive,
  Hash,
  Table,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type DatasetMeta } from "@/state/data/dataset";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { listOpfsRoot, readOpfsFile } from "@/core/storage/opfs.utils";
import IconButton from "@/components/IconButton";

/**
 * Choose an icon based on dataset type.
 */
const getFileIcon = (type: string) =>
  type.toLowerCase() === "json" ? FileText : Database;

/**
 * A single dataset list item, separated and memoized to minimize re-renders.
 */
const DatasourceItem = memo(function DatasetItem({
  dataset,
  isExpanded,
  onToggle,
  onAskDelete,
  formatDate,
  onShowGrid,
  allowDelete = true,
}: {
  dataset: DatasetMeta;
  isExpanded: boolean;
  onToggle: () => void;
  onAskDelete: () => void;
  formatDate: (iso: string) => string;
  onShowGrid: (e: React.MouseEvent) => void;
  /** Built-in sample dataset cannot be removed */
  allowDelete?: boolean;
}) {
  const Icon = getFileIcon(dataset.type);

  const openFileViewer = async () => {
    const entries = await listOpfsRoot();

    if (entries.length) {
      const firstFile = entries.find((e) => e.kind === "file");
      if (firstFile) {
        const content = await readOpfsFile(firstFile.name);
        console.log("File content:", content);
      }
    }
  };

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

            {allowDelete ? (
              <ButtonGroup>
                <IconButton
                  icon={Pencil}
                  size="lg"
                  iconSize={16}
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskDelete();
                  }}
                />
                <IconButton
                  icon={Trash2}
                  size="lg"
                  variant="ghost"
                  iconSize={16}
                  iconClassName="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskDelete();
                  }}
                />
              </ButtonGroup>
            ) : (
              <span className="text-xs text-muted-foreground px-2">
                Built-in
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/20">
          <h5 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2 justify-between">
            Data Preview
            <ButtonGroup>
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
              {dataset.type === "csv" ? (
                <>
                  <ButtonGroupSeparator />
                  <Button
                    aria-label="Open OPFS Directory"
                    variant="secondary"
                    size="sm"
                    onClick={openFileViewer}
                    className="text-primary hover:text-destructive hover:bg-destructive/10 cursor-pointer flex align-center gap-2"
                  >
                    File Viewer{" "}
                    <Table
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                  </Button>
                </>
              ) : null}
            </ButtonGroup>
          </h5>

          {/* Preview JSON (rendered as code, truncated for large arrays by parent) */}
          <pre className="text-xs text-muted-foreground bg-background rounded p-3 overflow-auto max-h-40 whitespace-pre-wrap break-words">
            {!allowDelete ? (
              <span>
                Timestamps (x) and numeric values (y) are generated on the
                dashboard. This dataset is not stored in IndexedDB.
              </span>
            ) : (
              JSON.stringify(dataset.preview, null, 2)
            )}
          </pre>
        </div>
      )}
    </div>
  );
});

export default DatasourceItem;
