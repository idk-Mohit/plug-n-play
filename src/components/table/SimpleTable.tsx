// path: src/components/DataTable.tsx
"use client";

import { useMemo, useRef } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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

interface DataTableProps<TData extends AnyRecord, TValue = unknown> {
  data: TData[];
  columns?: ColumnDef<TData, TValue>[];
  maxPreviewLen?: number; // truncate long cell text
  height?: number; // px, scroll area height; default 400
}

/** "user_name" | "userName" -> "User Name" */
const humanize = (key: string) =>
  key
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (s) => s.toUpperCase());

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
    header: humanize(key),
    cell: ({ getValue }) => {
      const v = getValue() as unknown;
      const text = preview(v, maxPreviewLen);
      return (
        <span title={isPrimitive(v) ? String(v ?? "") : JSON.stringify(v)}>
          {text}
        </span>
      );
    },
  }));
}

export function DataTable<TData extends AnyRecord, TValue = unknown>({
  columns: columnsProp,
  data,
  maxPreviewLen = 120,
  height = 400,
}: DataTableProps<TData, TValue>) {
  const columns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (columnsProp && columnsProp.length) return columnsProp;
    return inferColumns<TData>(data, maxPreviewLen) as ColumnDef<
      TData,
      TValue
    >[];
  }, [columnsProp, data, maxPreviewLen]);

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Virtualization
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // row height estimate (px)
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <div className="overflow-hidden rounded-md border bg-secondary/30">
      {/* Scroll container */}
      <div
        ref={parentRef}
        className="relative overflow-auto"
        style={{ height }}
      >
        <Table className="w-full">
          {/* keep thead simple; make each <th> sticky */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
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

          {/* Virtualized body with top/bottom padding rows */}
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
                        <TableCell key={cell.id}>
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
