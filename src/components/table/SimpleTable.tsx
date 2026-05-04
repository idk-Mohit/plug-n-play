import React, { useMemo, useRef } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GetRowResult } from "@/core/data-source/types";
import type { AnyRecord } from "@/types/data.types";
import { DataTableColumnHeader, DataTableViewOptions } from "./column-header";
import { Loader } from "../loader";

export type TableDataSource<TData extends AnyRecord> = {
  getRow: (i: number) => GetRowResult<TData>;
  total: number;
  revision: number;
};

interface DataTableBaseProps<TData extends AnyRecord, TValue = unknown> {
  columns?: ColumnDef<TData, TValue>[];
  maxPreviewLen?: number;
  height?: number | string;
  loading?: boolean;
  /** Fire when user scrolls near the bottom (dense `data` mode only). */
  onScrollNearEnd?: () => void;
  /** Distance from bottom (px) to treat as "near end". Default 160. */
  nearEndThresholdPx?: number;
}

export type DataTableProps<TData extends AnyRecord, TValue = unknown> =
  | (DataTableBaseProps<TData, TValue> & {
      data: TData[];
      dataSource?: undefined;
    })
  | (DataTableBaseProps<TData, TValue> & {
      data?: undefined;
      dataSource: TableDataSource<TData>;
    });

const isPrimitive = (v: unknown) =>
  v == null || ["string", "number", "boolean"].includes(typeof v);

const preview = (val: unknown, max = 120) => {
  if (val == null) return "";
  if (isPrimitive(val)) {
    const s = String(val);
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  }
  try {
    const s = JSON.stringify(val);
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  } catch {
    return String(val);
  }
};

function inferColumns<TData extends AnyRecord>(
  data: TData[],
  maxPreviewLen: number,
  sortable = true,
): ColumnDef<TData, unknown>[] {
  const first = data[0];
  if (!first) return [];
  return Object.keys(first).map((key) => ({
    id: key,
    accessorKey: key as keyof TData,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={key}
        sortable={sortable}
      />
    ),
    cell: ({ getValue }) => {
      const v = getValue() as unknown;
      const text = preview(v, maxPreviewLen);
      return (
        <span
          className="block truncate"
          title={isPrimitive(v) ? String(v ?? "") : JSON.stringify(v)}
        >
          {text}
        </span>
      );
    },
    size: 160,
    minSize: 80,
    maxSize: 500,
  }));
}

function columnAccessorKey<TData extends AnyRecord>(
  col: ColumnDef<TData, unknown>,
): keyof TData {
  if ("accessorKey" in col && col.accessorKey != null) {
    return col.accessorKey as keyof TData;
  }
  return col.id as keyof TData;
}

function loadingPlaceholderColumns<TData extends AnyRecord, TValue>(): ColumnDef<
  TData,
  TValue
>[] {
  return [
    {
      id: "__loading",
      accessorKey: "__loading" as keyof TData,
      header: () => (
        <span className="text-muted-foreground text-sm">Loading…</span>
      ),
      cell: () => null,
      size: 240,
      minSize: 80,
    },
  ] as ColumnDef<TData, TValue>[];
}

export function DataTable<TData extends AnyRecord, TValue = unknown>(
  props: DataTableProps<TData, TValue>,
) {
  const {
    columns: columnsProp,
    maxPreviewLen = 120,
    height = 400,
    loading = false,
    onScrollNearEnd,
    nearEndThresholdPx = 160,
  } = props;

  const dataProp = "data" in props ? props.data : undefined;
  const dataSource = "dataSource" in props ? props.dataSource : undefined;
  const isPaged = dataSource != null;
  const data = useMemo(
    () => (isPaged ? ([] as TData[]) : (dataProp ?? ([] as TData[]))),
    [isPaged, dataProp],
  );

  if (import.meta.env.DEV) {
    if (isPaged && "data" in props && props.data != null) {
      console.warn("DataTable: use either `data` or `dataSource`, not both.");
    }
    if (!isPaged && !("data" in props)) {
      console.warn("DataTable: pass `data` or `dataSource`.");
    }
  }

  // Inferred columns are cached in a ref so we don't call `dataSource.getRow(0)`
  // on every render. Without this, page 0 stays pinned in `hotPages` and gets
  // re-evicted in the sliding-window loop, leaving columns permanently empty.
  // Schema is stable across rows in a paged dataset, so first inference wins.
  // Reset across data sources by keying the component (e.g. `key={vizId}`).
  const cachedPagedColumnsRef = useRef<ColumnDef<TData, TValue>[] | null>(null);

  const columns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (columnsProp && columnsProp.length) return columnsProp;
    if (isPaged && dataSource) {
      const cached = cachedPagedColumnsRef.current;
      if (cached && cached.length > 0) return cached;
      const r = dataSource.getRow(0);
      if (r.state === "loaded") {
        const inferred = inferColumns<TData>(
          [r.row],
          maxPreviewLen,
          false,
        ) as ColumnDef<TData, TValue>[];
        cachedPagedColumnsRef.current = inferred;
        return inferred;
      }
      return [];
    }
    return inferColumns<TData>(data, maxPreviewLen, true) as ColumnDef<
      TData,
      TValue
    >[];
  }, [columnsProp, data, dataSource, isPaged, maxPreviewLen]);

  const effectiveColumns = useMemo(() => {
    if (columns.length > 0) return columns;
    if (isPaged && dataSource && dataSource.total > 0) {
      return loadingPlaceholderColumns<TData, TValue>();
    }
    return columns;
  }, [columns, dataSource, isPaged]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    ...(isPaged
      ? {
          enableSorting: false,
          enableColumnFilters: false,
          manualSorting: true,
          manualFiltering: true,
        }
      : {
          onSortingChange: setSorting,
          onColumnFiltersChange: setColumnFilters,
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    defaultColumn: { size: 160, minSize: 80 },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const rows = table.getRowModel().rows;
  const rowCount = isPaged ? (dataSource?.total ?? 0) : rows.length;

  const parentRef = useRef<HTMLDivElement | null>(null);
  const nearEndLockRef = useRef(false);

  const onScroll = () => {
    if (isPaged || !onScrollNearEnd || loading) return;
    const el = parentRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < nearEndThresholdPx) {
      if (nearEndLockRef.current) return;
      nearEndLockRef.current = true;
      onScrollNearEnd();
      window.setTimeout(() => {
        nearEndLockRef.current = false;
      }, 400);
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  const showPagedBody = isPaged && rowCount > 0;
  const showDenseBody = !isPaged && rows.length > 0;

  /** Match header column count; paged rows used to iterate `effectiveColumns` and ignored visibility. */
  const visibleFlatColumns = table.getVisibleFlatColumns();
  const visibleColSpan = Math.max(1, visibleFlatColumns.length);

  return (
    <div className="overflow-hidden rounded-md border bg-secondary/30">
      <DataTableViewOptions table={table} />
      <div
        ref={parentRef}
        className="relative overflow-auto"
        style={{ height }}
        onScroll={!isPaged && onScrollNearEnd ? onScroll : undefined}
      >
        <Table className="min-w-max table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {showPagedBody ? (
              <>
                {paddingTop > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColSpan}
                      style={{ height: paddingTop }}
                    />
                  </TableRow>
                )}
                {virtualItems.map((vi) => {
                  const res = dataSource!.getRow(vi.index);
                  if (res.state === "pending") {
                    return (
                      <TableRow
                        key={`paged-${vi.index}`}
                        data-index={vi.index}
                        style={{ height: vi.size }}
                      >
                        {visibleFlatColumns.map((tc) => (
                          <TableCell
                            key={tc.id}
                            style={{ width: tc.getSize() }}
                            className="truncate"
                          >
                            <div className="h-4 w-full max-w-[10rem] rounded bg-muted animate-pulse" />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  }
                  const rowData = res.row;
                  return (
                    <TableRow
                      key={`paged-${vi.index}`}
                      data-index={vi.index}
                      style={{ height: vi.size }}
                    >
                      {visibleFlatColumns.map((tc) => {
                        const col = tc.columnDef as ColumnDef<TData, TValue>;
                        const accessor = columnAccessorKey(col);
                        const raw = rowData[accessor];
                        const title = isPrimitive(raw)
                          ? String(raw ?? "")
                          : undefined;
                        return (
                          <TableCell
                            key={tc.id}
                            style={{ width: tc.getSize() }}
                            className="truncate"
                            title={title}
                          >
                            {col.cell
                              ? flexRender(col.cell, {
                                  getValue: () => rowData[accessor],
                                } as never)
                              : preview(raw, maxPreviewLen)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
                {paddingBottom > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColSpan}
                      style={{ height: paddingBottom }}
                    />
                  </TableRow>
                )}
              </>
            ) : showDenseBody ? (
              <>
                {paddingTop > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColSpan}
                      style={{ height: paddingTop }}
                    />
                  </TableRow>
                )}

                {virtualItems.map((vi) => {
                  const row = rows[vi.index]!;
                  return (
                    <TableRow
                      key={row.id}
                      data-index={vi.index}
                      data-state={row.getIsSelected() && "selected"}
                      style={{ height: vi.size }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="truncate"
                          title={
                            isPrimitive(cell.getValue() as unknown)
                              ? String(cell.getValue() ?? "")
                              : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {paddingBottom > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColSpan}
                      style={{ height: paddingBottom }}
                    />
                  </TableRow>
                )}
              </>
            ) : loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColSpan}
                  className="!p-0 h-[400px] align-center"
                >
                  <div className="flex justify-center items-center h-full w-full">
                    <Loader key={Math.random()} type="grid" size={64} />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColSpan}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
