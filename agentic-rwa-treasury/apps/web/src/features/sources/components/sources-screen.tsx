"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  DatabaseZap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { DataTable, type BasicColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Metric } from "@/components/ui/metric";
import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";
import { SourcesPageSkeleton } from "@/components/ui/page-skeletons";
import { TableLeadCell, TablePill } from "@/components/ui/table-cells";
import { Typography } from "@/components/ui/typography";
import {
  formatHash,
  formatRelativeDate,
  formatUtcDateTime,
} from "@/lib/format";
import type { SourceStatus } from "../model/types";
import { useSources } from "../queries/use-sources";

export function SourcesScreen() {
  const query = useSources();
  const columns = useMemo<Array<BasicColumnDef<SourceStatus>>>(
    () => [
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => (
          <TableLeadCell
            seed={row.original.id}
            subtitle={row.original.id}
            title={row.original.title}
          />
        ),
      },
      {
        accessorKey: "kind",
        header: "Type",
        meta: {
          headerClassName: "hidden lg:table-cell",
          cellClassName: "hidden lg:table-cell",
        },
        cell: ({ row }) => (
          <span className="capitalize">{row.original.kind}</span>
        ),
      },
      {
        accessorKey: "integration",
        header: "Integration",
        meta: {
          headerClassName: "hidden md:table-cell",
          cellClassName: "hidden md:table-cell",
        },
        cell: ({ row }) => (
          <Badge
            className={
              row.original.integration === "live"
                ? "border-accent/20 bg-accent-soft text-accent-strong"
                : row.original.integration === "chain"
                  ? "border-success/20 bg-success-soft text-success"
                  : ""
            }
          >
            {row.original.integration}
          </Badge>
        ),
      },
      {
        accessorKey: "fetchedAt",
        header: "Fetched",
        meta: {
          headerClassName: "hidden sm:table-cell",
          cellClassName: "hidden sm:table-cell",
        },
        cell: ({ row }) => (
          <span title={formatUtcDateTime(row.original.fetchedAt)}>
            {formatRelativeDate(row.original.fetchedAt)}
          </span>
        ),
      },
      {
        accessorKey: "contentHash",
        header: "Content hash",
        meta: {
          headerClassName: "hidden xl:table-cell",
          cellClassName: "hidden xl:table-cell",
        },
        cell: ({ row }) => (
          <div className="flex max-w-[12rem] items-center gap-1.5">
            <TablePill icon={Copy}>{formatHash(row.original.contentHash)}</TablePill>
            <CopyButton value={row.original.contentHash} />
          </div>
        ),
      },
      {
        accessorKey: "stale",
        header: "State",
        cell: ({ row }) =>
          row.original.stale ? (
            <Badge className="border-warning/20 bg-warning-soft text-warning">
              <Clock3 className="size-3" />
              Stale
            </Badge>
          ) : (
            <Badge className="border-success/20 bg-success-soft text-success">
              <CheckCircle2 className="size-3" />
              Fresh
            </Badge>
          ),
      },
    ],
    [],
  );

  if (query.isLoading)
    return <SourcesPageSkeleton />;
  return (
    <div className="page-shell dashboard-grid pb-24 lg:pb-6">
      <PageHeader
        icon={
          <IconTile className="size-8 rounded-[0.5rem]" tone="green">
            <DatabaseZap className="size-3.5" strokeWidth={1.75} />
          </IconTile>
        }
        description="The allocator reads bounded, hashed documents and live protocol state. Every source used by a decision is committed inside its canonical memo."
        title="Data sources"
      />
      <div className="dashboard-toolbar">
        <Typography className="text-muted" variant="ui">
          Latest committed decision corpus
        </Typography>
        <Badge>{query.data.length} sources</Badge>
      </div>
      <div className="dashboard-metric-strip">
        <Metric
          label="Committed sources"
          value={query.data.length}
          detail="latest corpus"
        />
        <Metric
          label="Fresh inputs"
          value={query.data.filter((source) => !source.stale).length}
          detail="explicit state"
        />
        <Metric
          label="Live integrations"
          value={
            query.data.filter((source) => source.integration !== "fixture")
              .length
          }
          detail="chain and liquidity"
        />
        <Metric
          label="Stale inputs"
          value={query.data.filter((source) => source.stale).length}
          detail="never hidden"
        />
      </div>
      <Panel className="overflow-hidden">
        <PanelHeader
          description="Source bytes are never trusted by title alone; the agent records a Keccak content hash and retrieval timestamps."
          title="Latest corpus"
        />
        {query.error ? (
          <Typography
            as="div"
            className="border-b border-danger/20 bg-danger-soft px-4 py-3 text-danger"
            variant="ui"
          >
            <AlertTriangle className="mr-2 inline size-3.5" />
            {query.error.message}
          </Typography>
        ) : null}
        {query.data.length ? (
          <DataTable
            columns={columns}
            data={query.data}
            getRowId={(source) => source.id}
          />
        ) : (
          <EmptyState
            icon={<DatabaseZap className="size-4" />}
            title="No source envelope available"
            description="Run a successful agent epoch, then refresh this view."
          />
        )}
      </Panel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {query.data.map((source) => (
          <Card key={source.id}>
            <CardContent className="grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-7 place-items-center rounded-[0.5rem] border border-line bg-soft text-muted">
                  <DatabaseZap className="size-3.5" />
                </div>
                <Badge>{source.kind}</Badge>
              </div>
              <div className="grid gap-0.5">
                <Typography as="h2" className="text-ink" variant="title">
                  {source.title}
                </Typography>
                <Typography className="text-subtle" variant="body">
                  {source.description}
                </Typography>
              </div>
              <Typography
                as="div"
                className="flex items-center gap-1 font-medium text-muted"
                variant="caption"
              >
                <Copy className="size-3" />
                {formatHash(source.contentHash)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
