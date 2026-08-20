"use client";

import { AlertTriangle, CalendarDays, Landmark, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
import { IconTile } from "@/components/ui/icon-tile";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";
import { VaultPageSkeleton } from "@/components/ui/page-skeletons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Typography } from "@/components/ui/typography";
import { useDecisions } from "@/features/decisions/queries/use-decisions";
import { formatBps, formatRelativeDate, formatTokenUsd } from "@/lib/format";
import { AllocationTable } from "./allocation-table";
import { TreasuryDistributionChart, TreasuryHistoryChart } from "./treasury-charts";
import { VaultActionsSheet } from "./vault-actions-sheet";
import { useVaultSnapshot } from "../queries/use-vault-snapshot";

export function VaultScreen() {
  const query = useVaultSnapshot();
  const decisionsQuery = useDecisions();
  const [chartView, setChartView] = useState<"overview" | "allocation" | "history">("overview");
  const [historyWindow, setHistoryWindow] = useState("24");
  if (query.isLoading) return <VaultPageSkeleton />;
  if (query.isError || !query.data) {
    return (
      <div className="page-shell grid min-h-[35rem] place-items-center">
          <div className="max-w-sm text-center">
            <AlertTriangle className="mx-auto size-6 text-danger" />
            <Typography as="h1" className="mt-3 text-ink" variant="heading">Vault state unavailable</Typography>
            <Typography className="mt-1 text-subtle" variant="body">{query.error instanceof Error ? query.error.message : "The configured X Layer endpoint did not return a usable response."}</Typography>
            <Button className="mt-4" leadingIcon={<RefreshCw className="size-3.5" />} onClick={() => void query.refetch()} variant="primary">Retry</Button>
          </div>
      </div>
    );
  }

  const snapshot = query.data;
  const decisions = decisionsQuery.data ?? [];
  const visibleDecisions = decisions.slice(0, Number(historyWindow));
  return (
    <div className="page-shell dashboard-grid pb-24 lg:pb-6">
        <PageHeader
          icon={<IconTile className="size-8 rounded-[0.5rem]" tone="blue"><Landmark className="size-3.5" strokeWidth={1.75} /></IconTile>}
          action={<div className="flex items-center gap-2"><Badge className="border-accent/20 bg-accent-soft text-accent-strong"><Sparkles className="size-3" />AI managed</Badge><Typography as="div" className="flex items-center gap-2 text-subtle" variant="caption">
            <span className="size-1.5 rounded-full bg-success" />
            Last rebalance {formatRelativeDate(snapshot.lastRebalanceAt * 1_000)}
          </Typography></div>}
          description="Deposit stablecoins into an ERC-4626 vault whose AI allocation proposals remain bounded by immutable on-chain policy."
          title="Agentic RWA Treasury"
        />

        <div className="dashboard-toolbar">
          <label className="flex h-8 items-center gap-2 rounded-[0.5625rem] border border-line bg-surface px-2.5 text-muted shadow-[var(--shadow-surface)]">
            <CalendarDays aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            <span className="sr-only">History range</span>
            <select className="bg-transparent text-[0.8125rem] font-medium text-ink outline-none" onChange={(event) => setHistoryWindow(event.target.value)} value={historyWindow}>
              <option value="24">Last 24 epochs</option>
              <option value="48">Last 48 epochs</option>
              <option value="71">All epochs</option>
            </select>
          </label>
          <div className="flex items-center gap-2">
            <SegmentedControl items={[{ value: "overview", label: "Overview" }, { value: "allocation", label: "Allocation" }, { value: "history", label: "History" }]} onValueChange={setChartView} value={chartView} />
            <VaultActionsSheet snapshot={snapshot} />
          </div>
        </div>

        <div className="dashboard-metric-strip">
          <Metric detail="pooled mUSDC" label="Total value locked" value={formatTokenUsd(snapshot.totalAssets, true)} />
          <Metric detail="weighted estimate" label="Vault APY" value={formatBps(snapshot.weightedApyBps)} />
          <Metric detail={snapshot.userShareBalance > 0n ? "live rtUSD" : "connect wallet"} label="Your position" value={formatTokenUsd(snapshot.userPositionAssets)} />
          <Metric detail="per rtUSD" label="Share price" value={`$${snapshot.sharePrice.toFixed(4)}`} />
        </div>

        {chartView !== "history" ? <TreasuryDistributionChart snapshot={snapshot} /> : null}
        {chartView !== "allocation" ? <TreasuryHistoryChart decisions={visibleDecisions} /> : null}

        <Panel className="overflow-hidden">
          <PanelHeader action={<Badge>3 whitelisted strategies</Badge>} description="Actual adapter balances and the latest contract-approved target." title="Portfolio allocation" />
          <AllocationTable strategies={snapshot.strategies} />
        </Panel>
    </div>
  );
}
