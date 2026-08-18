"use client";

import { Activity, CircleDollarSign, Landmark } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type BasicColumnDef } from "@/components/ui/data-table";
import { ProgressBar } from "@/components/ui/progress-bar";
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
            <div className="flex min-w-[12rem] items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-[0.5rem] border border-line bg-soft text-muted">
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <div className="font-medium text-ink">{strategy.name}</div>
                <div className="mt-0.5 max-w-[17rem] truncate text-xs text-subtle">{strategy.description}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "allocation",
        header: "Allocation",
        cell: ({ row }) => {
          const strategy = row.original;
          return (
            <div className="min-w-[8rem]">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="font-medium text-ink number-tabular">{formatBps(strategy.weightBps)}</span>
                <span className="text-xs text-subtle">Target {formatBps(strategy.targetWeightBps)}</span>
              </div>
              <ProgressBar value={strategy.weightBps / 100} />
            </div>
          );
        },
      },
      {
        accessorKey: "assets",
        header: "Assets",
        cell: ({ row }) => <span className="font-medium text-ink number-tabular">{formatTokenUsd(row.original.assets)}</span>,
      },
      {
        accessorKey: "apyBps",
        header: "APY",
        cell: ({ row }) => <span className="font-medium text-success number-tabular">{formatBps(row.original.apyBps)}</span>,
      },
      {
        accessorKey: "status",
        header: "State",
        cell: ({ row }) => (
          <Badge className={row.original.status === "active" ? "border-success/20 bg-success-soft text-success" : "bg-soft text-muted"}>
            <span className={row.original.status === "active" ? "size-1.5 rounded-full bg-success" : "size-1.5 rounded-full bg-subtle"} />
            {row.original.status === "active" ? "Earning" : "Reserve"}
          </Badge>
        ),
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={strategies} getRowId={(strategy) => strategy.id} />;
}
