"use client";

import { Activity, CircleDollarSign, Landmark } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type BasicColumnDef } from "@/components/ui/data-table";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TableLeadCell } from "@/components/ui/table-cells";
import { Typography } from "@/components/ui/typography";
import { formatBps, formatTokenUsd } from "@/lib/format";
import type { StrategyPosition } from "../model/types";

const strategyIcons = {
  rwa: Landmark,
  lending: Activity,
  idle: CircleDollarSign,
} as const;

export function AllocationTable({ strategies }: { strategies: readonly StrategyPosition[] }) {
  const columns = useMemo<Array<BasicColumnDef<StrategyPosition>>>(
    () => [
      {
        id: "strategy",
        header: "Strategy",
        cell: ({ row }) => {
          const strategy = row.original;
          const Icon = strategyIcons[strategy.id];
          return (
            <TableLeadCell
              icon={Icon}
              seed={strategy.id}
              subtitle={strategy.description}
              title={strategy.name}
            />
          );
        },
      },
      {
        id: "allocation",
        header: "Allocation",
        meta: {
          headerClassName: "hidden md:table-cell",
          cellClassName: "hidden md:table-cell",
        },
        cell: ({ row }) => {
          const strategy = row.original;
          return (
            <div className="min-w-[7.5rem]">
              <div className="mb-1 flex items-center justify-between gap-2">
                <Typography as="span" className="font-medium text-ink" variant="ui">
                  {formatBps(strategy.weightBps)}
                </Typography>
                <Typography as="span" className="text-subtle" variant="caption">
                  {formatBps(strategy.targetWeightBps)}
                </Typography>
              </div>
              <ProgressBar value={strategy.weightBps / 100} />
            </div>
          );
        },
      },
      {
        accessorKey: "assets",
        header: "Assets",
        cell: ({ row }) => (
          <Typography as="span" className="font-medium text-ink" variant="ui">
            {formatTokenUsd(row.original.assets)}
          </Typography>
        ),
      },
      {
        accessorKey: "apyBps",
        header: "APY",
        meta: {
          headerClassName: "hidden sm:table-cell",
          cellClassName: "hidden sm:table-cell",
        },
        cell: ({ row }) => (
          <Typography as="span" className="font-medium text-success" variant="ui">
            {formatBps(row.original.apyBps)}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "State",
        cell: ({ row }) => (
          <Badge
            className={
              row.original.status === "active"
                ? "border-success/20 bg-success-soft text-success"
                : "bg-soft text-muted"
            }
          >
            <span
              className={
                row.original.status === "active"
                  ? "size-1.5 rounded-full bg-success"
                  : "size-1.5 rounded-full bg-subtle"
              }
            />
            {row.original.status === "active" ? "Earning" : "Reserve"}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={strategies}
      getRowId={(strategy) => strategy.id}
    />
  );
}
