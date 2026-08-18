"use client";

import { Activity, AlertTriangle, Landmark, RefreshCw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBps, formatRelativeDate, formatTokenUsd } from "@/lib/format";
import { AllocationTable } from "./allocation-table";
import { IntegrityPanel } from "./integrity-panel";
import { PolicyPanel } from "./policy-panel";
import { TransactionCard } from "./transaction-card";
import { VaultContextRail } from "./vault-context-rail";
import { useVaultSnapshot } from "../queries/use-vault-snapshot";

function VaultLoading() {
  return (
    <div className="page-shell">
      <Skeleton className="h-8 w-48" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-24" key={index} />)}
      </div>
      <Skeleton className="mt-4 h-72" />
    </div>
  );
}

export function VaultScreen() {
  const query = useVaultSnapshot();
  if (query.isLoading) return <AppShell context={<div />}><VaultLoading /></AppShell>;
  if (query.isError || !query.data) {
    return (
      <AppShell context={<div />}>
        <div className="page-shell grid min-h-[35rem] place-items-center">
          <div className="max-w-sm text-center">
            <AlertTriangle className="mx-auto size-6 text-danger" />
            <h1 className="mt-3 page-heading">Vault state unavailable</h1>
            <p className="mt-1 text-xs leading-5 text-subtle">{query.error instanceof Error ? query.error.message : "The configured X Layer endpoint did not return a usable response."}</p>
            <Button className="mt-4" leadingIcon={<RefreshCw className="size-3.5" />} onClick={() => void query.refetch()} variant="primary">Retry</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const snapshot = query.data;
  return (
    <AppShell context={<VaultContextRail snapshot={snapshot} />}>
      <div className="page-shell pb-24 lg:pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-heading">Agentic RWA Treasury</h1>
              <Badge className="border-accent/20 bg-accent-soft text-accent-strong"><Sparkles className="size-3" />AI managed</Badge>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-subtle">Deposit stablecoins into an ERC-4626 vault whose AI allocation proposals remain bounded by immutable on-chain policy.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-subtle">
            <span className="size-1.5 rounded-full bg-success" />
            Last rebalance {formatRelativeDate(snapshot.lastRebalanceAt * 1_000)}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric detail="Pooled mUSDC across three adapters" icon={<Landmark className="size-3.5" />} label="Total value locked" value={formatTokenUsd(snapshot.totalAssets, true)} />
          <Metric detail="Current strategy-weighted estimate" icon={<Activity className="size-3.5" />} label="Vault APY" value={formatBps(snapshot.weightedApyBps)} />
          <Metric detail={`${snapshot.userShareBalance > 0n ? "Your live rtUSD position" : "Connect to reveal position"}`} icon={<Sparkles className="size-3.5" />} label="Your position" value={formatTokenUsd(snapshot.userPositionAssets)} />
          <Metric detail="Yield accrues into share price" icon={<RefreshCw className="size-3.5" />} label="rtUSD share price" value={`$${snapshot.sharePrice.toFixed(4)}`} />
        </div>

        <Panel className="mt-4 overflow-hidden">
          <PanelHeader action={<Badge>3 whitelisted strategies</Badge>} description="Actual adapter balances and the latest contract-approved target." title="Portfolio allocation" />
          <AllocationTable strategies={snapshot.strategies} />
        </Panel>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <TransactionCard snapshot={snapshot} />
          <div className="grid gap-4">
            <PolicyPanel />
            <IntegrityPanel lastRebalanceAt={snapshot.lastRebalanceAt} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
