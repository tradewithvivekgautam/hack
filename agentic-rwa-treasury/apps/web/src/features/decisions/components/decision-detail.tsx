"use client";

import { chainById } from "@agentic-rwa/shared";
import { AlertTriangle, Bot, BrainCircuit, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddress, formatEpoch, formatHash, formatUtcDateTime } from "@/lib/format";
import type { DecisionRecord } from "../model/types";
import { useDecisionEnvelope } from "../queries/use-decisions";
import { DecisionAllocationTable } from "./decision-allocation-table";
import { VerificationCard } from "./verification-card";

export function DecisionDetail({ decision }: { decision: DecisionRecord }) {
  const envelopeQuery = useDecisionEnvelope(decision.reasoningCid, decision.envelope);
  const envelope = envelopeQuery.data;
  const explorer = chainById(envelope?.chain.chainId ?? 1_952).blockExplorers?.default.url;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-heading">Decision {formatEpoch(decision.epoch)}</h1>
            <Badge className="border-success/20 bg-success-soft text-success"><ShieldCheck className="size-3" />Recorded</Badge>
            <Badge className={decision.confidence === "high" ? "border-success/20 bg-success-soft text-success" : decision.confidence === "low" ? "border-warning/20 bg-warning-soft text-warning" : "border-accent/20 bg-accent-soft text-accent-strong"}>{decision.confidence} confidence</Badge>
          </div>
          <p className="mt-1 text-xs text-subtle">Submitted {formatUtcDateTime(decision.timestamp)} by {formatAddress(decision.agent)}</p>
        </div>
        {decision.transactionHash && explorer ? (
          <a className="inline-flex h-7 items-center gap-1.5 rounded-[0.5rem] border border-line bg-surface px-2.5 text-xs font-medium text-muted hover:bg-soft hover:text-ink" href={`${explorer}/tx/${decision.transactionHash}`} rel="noreferrer" target="_blank">
            Explorer <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>

      <VerificationCard decision={decision} />

      {envelopeQuery.isLoading ? (
        <div className="grid gap-3"><Skeleton className="h-36" /><Skeleton className="h-72" /></div>
      ) : envelopeQuery.isError || !envelope ? (
        <Panel>
          <EmptyState icon={<AlertTriangle className="size-4 text-danger" />} title="Decision memo unavailable" description={envelopeQuery.error instanceof Error ? envelopeQuery.error.message : "The committed IPFS payload could not be loaded."} />
        </Panel>
      ) : (
        <>
          <Panel className="overflow-hidden">
            <PanelHeader action={<BrainCircuit className="size-4 text-accent" />} description="The signed-off allocator memo—not private chain-of-thought." title="Allocation thesis" />
            <div className="p-4">
              <p className="max-w-4xl text-[0.8125rem] leading-6 text-muted">{envelope.proposal.thesis}</p>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader description="Each rationale cites source identifiers inside the same canonical envelope." title="Strategy rationale" />
            <DecisionAllocationTable envelope={envelope} />
          </Panel>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel className="overflow-hidden">
              <PanelHeader action={<AlertTriangle className="size-4 text-warning" />} title="Flagged risks" />
              <ol className="divide-y divide-line">
                {envelope.proposal.risks.map((risk, index) => (
                  <li className="flex gap-3 px-4 py-3 text-xs leading-5 text-muted" key={risk}>
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-warning-soft text-xs font-semibold text-warning">{index + 1}</span>
                    {risk}
                  </li>
                ))}
              </ol>
            </Panel>
            <Panel className="overflow-hidden">
              <PanelHeader action={<Bot className="size-4 text-accent" />} title="Execution metadata" />
              <dl className="divide-y divide-line">
                {[
                  ["Provider", envelope.model.provider],
                  ["Model", envelope.model.modelId],
                  ["Prompt", envelope.prompt.version],
                  ["Temperature", envelope.model.temperature.toString()],
                  ["Sources", envelope.sources.length.toString()],
                  ["Reasoning CID", decision.reasoningCid],
                ].map(([label, value]) => (
                  <div className="flex min-h-10 items-center gap-3 px-4 py-2" key={label}>
                    <dt className="w-24 shrink-0 text-xs text-subtle">{label}</dt>
                    <dd className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{value}</dd>
                    {label === "Reasoning CID" ? <CopyButton value={value ?? ""} /> : null}
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <Panel className="overflow-hidden">
            <PanelHeader action={<FileText className="size-4 text-muted" />} description="Hashes make the input corpus tamper-evident after collection." title="Source evidence" />
            <div className="divide-y divide-line">
              {envelope.sources.map((source) => (
                <div className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_9rem_8rem] sm:items-center" key={source.id}>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-ink">{source.title}</div>
                    <div className="mt-0.5 truncate text-xs text-subtle">{source.id}</div>
                  </div>
                  <div className="text-xs text-subtle">{source.kind.replaceAll("-", " ")}</div>
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted"><span>{formatHash(source.contentHash)}</span><CopyButton value={source.contentHash} /></div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
