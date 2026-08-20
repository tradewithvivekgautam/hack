"use client";

import { AlertTriangle, RefreshCw, ScrollText } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { DecisionsPageSkeleton } from "@/components/ui/page-skeletons";
import { Typography, typographyVariants } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatEpoch } from "@/lib/format";
import { DecisionDetail } from "./decision-detail";
import { useDecisions } from "../queries/use-decisions";

export function DecisionsScreen() {
  const query = useDecisions();
  const [requestedEpoch, setRequestedEpoch] = useQueryState("epoch", parseAsInteger);
  const decisions = query.data ?? [];
  const selectedEpoch = requestedEpoch ?? decisions[0]?.epoch ?? 0;
  const selected = decisions.find((decision) => decision.epoch === selectedEpoch) ?? decisions[0];
  const select = (epoch: number) => void setRequestedEpoch(epoch, { history: "replace" });

  if (query.isLoading) {
    return <DecisionsPageSkeleton />;
  }
  if (query.isError) {
    return (
      <div className="page-shell grid min-h-[35rem] place-items-center">
          <div className="max-w-sm text-center"><AlertTriangle className="mx-auto size-6 text-danger" /><Typography as="h1" className="mt-3 text-ink" variant="heading">Decision registry unavailable</Typography><Typography className="mt-1 text-subtle" variant="body">{query.error instanceof Error ? query.error.message : "The registry query failed."}</Typography><Button className="mt-4" leadingIcon={<RefreshCw className="size-3.5" />} onClick={() => void query.refetch()} variant="primary">Retry</Button></div>
      </div>
    );
  }
  if (!selected) {
    return <div className="page-shell"><Panel><EmptyState icon={<ScrollText className="size-4" />} title="No decisions recorded" description="The first successful agent rebalance will appear here." /></Panel></div>;
  }

  return (
    <div className="page-shell pb-24 lg:pb-6">
        <div className="mb-4 lg:hidden">
          <Typography as="label" className="text-subtle" htmlFor="mobile-epoch" variant="label">Selected epoch</Typography>
          <select className={cn(typographyVariants.ui, "mt-1.5 h-9 w-full rounded-[0.5625rem] border border-line bg-surface px-2.5 text-ink")} id="mobile-epoch" onChange={(event) => select(Number(event.target.value))} value={selected.epoch}>
            {decisions.map((decision) => <option key={decision.epoch} value={decision.epoch}>{formatEpoch(decision.epoch)} · {decision.confidence} confidence</option>)}
          </select>
        </div>
        <DecisionDetail decision={selected} history={decisions} />
    </div>
  );
}
