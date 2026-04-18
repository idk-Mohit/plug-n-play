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
import type { AnyRecord } from "@/types/data.types";
import { DataTableColumnHeader, DataTableViewOptions } from "./column-header";
import { Loader } from "../loader";

interface DataTableProps<TData extends AnyRecord, TValue = unknown> {
  data: TData[];
  columns?: ColumnDef<TData, TValue>[];
  maxPreviewLen?: number;
  height?: number | string;
  loading?: boolean;
  /** Fire when user scrolls near the bottom (e.g. load next page). */
  onScrollNearEnd?: () => void;
  /** Distance from bottom (px) to treat as "near end". Default 160. */
  nearEndThresholdPx?: number;
}

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
  maxPreviewLen: number
): ColumnDef<TData, unknown>[] {
  const first = data[0];
  if (!first) return [];
  return Object.keys(first).map((key) => ({
    id: key,
    accessorKey: key as keyof TData,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={key} />
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

export function DataTable<TData extends AnyRecord, TValue = unknown>({
  columns: columnsProp,
  data,
  maxPreviewLen = 120,
  height = 400,
  loading = false,
  onScrollNearEnd,
  nearEndThresholdPx = 160,
}: DataTableProps<TData, TValue>) {
  const columns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (columnsProp && columnsProp.length) return columnsProp;
    return inferColumns<TData>(data, maxPreviewLen) as ColumnDef<
      TData,
      TValue
    >[];
  }, [columnsProp, data, maxPreviewLen]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    // keep widths stable and accessible to header/cells
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

  // Virtualization
  const parentRef = useRef<HTMLDivElement | null>(null);
  const nearEndLockRef = useRef(false);

  const onScroll = () => {
    if (!onScrollNearEnd || loading) return;
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
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <div className="overflow-hidden rounded-md border bg-secondary/30">
      <DataTableViewOptions table={table} />
      <div
        ref={parentRef}
        className="relative overflow-auto"
        style={{ height }}
        onScroll={onScrollNearEnd ? onScroll : undefined}
      >
        {/* IMPORTANT: real table, not grid; fixed layout; allow horizontal scroll */}
        <Table className="min-w-max table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    // bind width to TanStack column size
                    style={{ width: header.column.getSize() }}
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length ? (
              <>
                {paddingTop > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
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
                          // same width as its header
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
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {paddingBottom > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length || 1}
                      style={{ height: paddingBottom }}
                    />
                  </TableRow>
                )}
              </>
            ) : loading ? (
              // <TableRow>
              //   <TableCell
              //     colSpan={columns.length || 1}
              //     className="text-center"
              //   >
              //     <Loader key={Math.random()} type="grid" size={64} />
              //   </TableCell>
              // </TableRow>
              <TableRow>
                <TableCell
                  colSpan={columns.length || 1}
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
                  colSpan={columns.length || 1}
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
