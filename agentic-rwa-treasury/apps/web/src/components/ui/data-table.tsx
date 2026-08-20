"use client";

import {
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export const basicTableFeatures = tableFeatures({});

export type TableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

export type BasicColumnDef<T extends RowData> = ColumnDef<
  typeof basicTableFeatures,
  T
> & {
  meta?: TableColumnMeta;
};

export function DataTable<T extends RowData>({
  data,
  columns,
  empty,
  className,
  getRowId,
  compact = true,
}: {
  data: readonly T[];
  columns: Array<BasicColumnDef<T>>;
  empty?: ReactNode;
  className?: string;
  getRowId?: (row: T, index: number) => string;
  compact?: boolean;
}) {
  const table = useTable({
    features: basicTableFeatures,
    data: [...data],
    columns,
    ...(getRowId ? { getRowId } : {}),
  });
  const rows = table.getRowModel().rows;

  return (
    <Table className={cn(compact ? "min-w-[36rem]" : undefined, className)}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => {
              const meta = header.column.columnDef.meta as
                | TableColumnMeta
                | undefined;
              return (
                <TableHead
                  className={meta?.headerClassName}
                  key={header.id}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => {
                const meta = cell.column.columnDef.meta as
                  | TableColumnMeta
                  | undefined;
                return (
                  <TableCell className={meta?.cellClassName} key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              className={cn(
                "h-12 text-center text-[0.8125rem] text-subtle",
              )}
              colSpan={columns.length}
            >
              {empty ?? "No data"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
