"use client";

import { AlertTriangle, RefreshCw, ScrollText } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEpoch } from "@/lib/format";
import { DecisionContextRail } from "./decision-context-rail";
import { DecisionDetail } from "./decision-detail";
import { useDecisions } from "../queries/use-decisions";

export function DecisionsScreen() {
  const query = useDecisions();
  const [requestedEpoch, setRequestedEpoch] = useQueryState("epoch", parseAsInteger);
  const decisions = query.data ?? [];
  const selectedEpoch = requestedEpoch ?? decisions[0]?.epoch ?? 0;
  const selected = decisions.find((decision) => decision.epoch === selectedEpoch) ?? decisions[0];
  const select = (epoch: number) => void setRequestedEpoch(epoch, { history: "replace" });

  const context = <DecisionContextRail decisions={decisions} onSelect={select} selectedEpoch={selected?.epoch ?? 0} />;
  if (query.isLoading) {
    return <AppShell context={context}><div className="page-shell"><Skeleton className="h-8 w-44" /><Skeleton className="mt-4 h-32" /><Skeleton className="mt-4 h-72" /></div></AppShell>;
  }
  if (query.isError) {
    return (
      <AppShell context={context}>
        <div className="page-shell grid min-h-[35rem] place-items-center">
          <div className="max-w-sm text-center"><AlertTriangle className="mx-auto size-6 text-danger" /><h1 className="mt-3 page-heading">Decision registry unavailable</h1><p className="mt-1 text-xs leading-5 text-subtle">{query.error instanceof Error ? query.error.message : "The registry query failed."}</p><Button className="mt-4" leadingIcon={<RefreshCw className="size-3.5" />} onClick={() => void query.refetch()} variant="primary">Retry</Button></div>
        </div>
      </AppShell>
    );
  }
  if (!selected) {
    return <AppShell context={context}><div className="page-shell"><Panel><EmptyState icon={<ScrollText className="size-4" />} title="No decisions recorded" description="The first successful agent rebalance will appear here." /></Panel></div></AppShell>;
  }

  return (
    <AppShell context={context}>
      <div className="page-shell pb-24 lg:pb-6">
        <div className="mb-4 lg:hidden">
          <label className="section-label" htmlFor="mobile-epoch">Selected epoch</label>
          <select className="mt-1.5 h-9 w-full rounded-[0.5625rem] border border-line bg-surface px-2.5 text-xs text-ink" id="mobile-epoch" onChange={(event) => select(Number(event.target.value))} value={selected.epoch}>
            {decisions.map((decision) => <option key={decision.epoch} value={decision.epoch}>{formatEpoch(decision.epoch)} · {decision.confidence} confidence</option>)}
          </select>
        </div>
        <DecisionDetail decision={selected} />
      </div>
    </AppShell>
  );
}
