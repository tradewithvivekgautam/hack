"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Copy, DatabaseZap, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { DataTable, type BasicColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Metric } from "@/components/ui/metric";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHash, formatRelativeDate, formatUtcDateTime } from "@/lib/format";
import type { SourceStatus } from "../model/types";
import { useSources } from "../queries/use-sources";
import { SourceContextRail } from "./source-context-rail";

export function SourcesScreen() {
  const query = useSources();
  const columns = useMemo<Array<BasicColumnDef<SourceStatus>>>(() => [
    { id: "source", header: "Source", cell: ({ row }) => <div className="min-w-[14rem]"><div className="font-medium text-ink">{row.original.title}</div><div className="mt-0.5 text-xs text-subtle">{row.original.id}</div></div> },
    { accessorKey: "kind", header: "Type", cell: ({ row }) => <span className="capitalize">{row.original.kind}</span> },
    { accessorKey: "integration", header: "Integration", cell: ({ row }) => <Badge className={row.original.integration === "live" ? "border-accent/20 bg-accent-soft text-accent-strong" : row.original.integration === "chain" ? "border-success/20 bg-success-soft text-success" : ""}>{row.original.integration}</Badge> },
    { accessorKey: "fetchedAt", header: "Fetched", cell: ({ row }) => <span title={formatUtcDateTime(row.original.fetchedAt)}>{formatRelativeDate(row.original.fetchedAt)}</span> },
    { accessorKey: "contentHash", header: "Content hash", cell: ({ row }) => <div className="flex items-center gap-1 font-medium text-ink"><span>{formatHash(row.original.contentHash)}</span><CopyButton value={row.original.contentHash} /></div> },
    { accessorKey: "stale", header: "State", cell: ({ row }) => row.original.stale ? <Badge className="border-warning/20 bg-warning-soft text-warning"><Clock3 className="size-3" />Stale</Badge> : <Badge className="border-success/20 bg-success-soft text-success"><CheckCircle2 className="size-3" />Fresh</Badge> },
  ], []);

  if (query.isLoading) return <AppShell context={<div />}><div className="page-shell"><Skeleton className="h-8 w-40" /><Skeleton className="mt-4 h-72" /></div></AppShell>;
  return (
    <AppShell context={<SourceContextRail sources={query.data} />}>
      <div className="page-shell pb-24 lg:pb-6">
        <div>
          <h1 className="page-heading">Data sources</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-subtle">The allocator reads bounded, hashed documents and live protocol state. Every source used by a decision is committed inside its canonical memo.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric icon={<DatabaseZap className="size-3.5" />} label="Committed sources" value={query.data.length} detail="Latest decision corpus" />
          <Metric icon={<CheckCircle2 className="size-3.5" />} label="Fresh inputs" value={query.data.filter((source) => !source.stale).length} detail="Staleness is explicit" />
          <Metric icon={<ExternalLink className="size-3.5" />} label="Live integrations" value={query.data.filter((source) => source.integration !== "fixture").length} detail="Chain and liquidity data" />
        </div>
        <Panel className="mt-4 overflow-hidden">
          <PanelHeader description="Source bytes are never trusted by title alone; the agent records a Keccak content hash and retrieval timestamps." title="Latest corpus" />
          {query.error ? <div className="border-b border-danger/20 bg-danger-soft px-4 py-3 text-xs text-danger"><AlertTriangle className="mr-2 inline size-3.5" />{query.error.message}</div> : null}
          {query.data.length ? <DataTable columns={columns} data={query.data} getRowId={(source) => source.id} /> : <EmptyState icon={<DatabaseZap className="size-4" />} title="No source envelope available" description="Run a successful agent epoch, then refresh this view." />}
        </Panel>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {query.data.map((source) => <Panel className="p-4" key={source.id}><div className="flex items-start justify-between gap-2"><div className="grid size-7 place-items-center rounded-[0.5rem] border border-line bg-soft text-muted"><DatabaseZap className="size-3.5" /></div><Badge>{source.kind}</Badge></div><h2 className="mt-3 text-[0.8125rem] font-semibold text-ink">{source.title}</h2><p className="mt-1 text-xs leading-5 text-subtle">{source.description}</p><div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted"><Copy className="size-3" />{formatHash(source.contentHash)}</div></Panel>)}
        </div>
      </div>
    </AppShell>
  );
}
