"use client";
import { tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const basicTableFeatures = tableFeatures({});
export type BasicColumnDef<T> = ColumnDef<typeof basicTableFeatures, T>;

export function DataTable<T>({ data, columns, empty, className, getRowId }: { data: readonly T[]; columns: Array<BasicColumnDef<T>>; empty?: ReactNode; className?: string; getRowId?: (row: T, index: number) => string }) {
  const table = useTable({ features: basicTableFeatures, data: [...data], columns, getRowId });
  const rows = table.getRowModel().rows;
  return <div className={cn("overflow-x-auto", className)}><table className="w-full border-collapse text-left"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id} className="border-b border-line">{group.headers.map((header) => <th key={header.id} className="h-9 whitespace-nowrap px-3 text-xs font-medium uppercase tracking-[0.04em] text-subtle">{header.isPlaceholder ? null : <table.FlexRender header={header} />}</th>)}</tr>)}</thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-b border-line last:border-0 hover:bg-soft/60">{row.getAllCells().map((cell) => <td key={cell.id} className="h-11 whitespace-nowrap px-3 text-xs text-muted"><table.FlexRender cell={cell} /></td>)}</tr>) : <tr><td colSpan={columns.length} className="p-6 text-center text-xs text-subtle">{empty ?? "No data"}</td></tr>}</tbody></table></div>;
}
