"use client";

import { chainById } from "@agentic-rwa/shared";
import { AlertTriangle, Bot, BrainCircuit, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { DistributionBar } from "@/components/ui/category-bar";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/description-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Metric } from "@/components/ui/metric";
import { IconTile } from "@/components/ui/icon-tile";
import { Panel, PanelContent, PanelHeader } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";
import { DecisionEnvelopeSkeleton } from "@/components/ui/page-skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableLeadCell, TablePill } from "@/components/ui/table-cells";
import { Typography, typographyVariants } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatAddress, formatBps, formatEpoch, formatHash, formatTokenUsd, formatUtcDateTime } from "@/lib/format";
import { TreasuryHistoryChart } from "@/features/vault/components/treasury-charts";
import type { DecisionRecord } from "../model/types";
import { useDecisionEnvelope } from "../queries/use-decisions";
import { DecisionAllocationTable } from "./decision-allocation-table";
import { DecisionActivityTimeline } from "./decision-activity-timeline";
import { VerificationCard } from "./verification-card";

export function DecisionDetail({ decision, history }: { decision: DecisionRecord; history: readonly DecisionRecord[] }) {
  const envelopeQuery = useDecisionEnvelope(decision.reasoningCid, decision.envelope);
  const envelope = envelopeQuery.data;
  const explorer = chainById(envelope?.chain.chainId ?? 1_952).blockExplorers?.default.url;
  const distributionSegments = [
    { label: "RWA", value: decision.weights.rwa, colorClassName: "bg-category-amber", detail: formatBps(decision.weights.rwa) },
    { label: "Lending", value: decision.weights.lending, colorClassName: "bg-category-blue", detail: formatBps(decision.weights.lending) },
    { label: "Idle", value: decision.weights.idle, colorClassName: "bg-category-green", detail: formatBps(decision.weights.idle) },
  ] as const;

  return (
    <div className="grid gap-3">
      <PageHeader
        icon={<IconTile className="size-8 rounded-[0.5rem]" tone="violet"><BrainCircuit className="size-3.5" strokeWidth={1.75} /></IconTile>}
        action={decision.transactionHash && explorer ? (
          <a className={cn(typographyVariants.caption, "inline-flex h-7 items-center gap-1.5 rounded-[0.5rem] border border-line bg-surface px-2.5 font-medium text-muted hover:bg-soft hover:text-ink")} href={`${explorer}/tx/${decision.transactionHash}`} rel="noreferrer" target="_blank">
            Explorer <ExternalLink className="size-3.5" />
          </a>
        ) : null}
        description={`Submitted ${formatUtcDateTime(decision.timestamp)} by ${formatAddress(decision.agent)}`}
        title={<span className="inline-flex flex-wrap items-center gap-2">Decision {formatEpoch(decision.epoch)}<Badge className="border-success/20 bg-success-soft text-success"><ShieldCheck className="size-3" />Recorded</Badge><Badge className={decision.confidence === "high" ? "border-success/20 bg-success-soft text-success" : decision.confidence === "low" ? "border-warning/20 bg-warning-soft text-warning" : "border-accent/20 bg-accent-soft text-accent-strong"}>{decision.confidence} confidence</Badge></span>}
      />

      <div className="dashboard-toolbar"><Typography className="text-muted" variant="ui">Recorded allocation snapshot</Typography><Badge>{history.length} epochs</Badge></div>

      <div className="dashboard-metric-strip">
        <Metric detail="recorded assets" label="Treasury value" value={formatTokenUsd(decision.totalAssets, true)} />
        <Metric detail="portfolio weight" label="RWA" value={formatBps(decision.weights.rwa)} />
        <Metric detail="portfolio weight" label="Lending" value={formatBps(decision.weights.lending)} />
        <Metric detail="liquid reserve" label="Idle" value={formatBps(decision.weights.idle)} />
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader description="Exact allocation committed for this epoch." title="Distribution" />
        <PanelContent className="pt-2">
          <DistributionBar segments={distributionSegments} />
        </PanelContent>
      </Panel>

      <TreasuryHistoryChart decisions={history} />

      <VerificationCard decision={decision} />

      <DecisionActivityTimeline decision={decision} />

      {envelopeQuery.isLoading ? (
        <DecisionEnvelopeSkeleton />
      ) : envelopeQuery.isError || !envelope ? (
        <Panel>
          <EmptyState icon={<AlertTriangle className="size-4 text-danger" />} title="Decision memo unavailable" description={envelopeQuery.error instanceof Error ? envelopeQuery.error.message : "The committed IPFS payload could not be loaded."} />
        </Panel>
      ) : (
        <>
          <Panel className="overflow-hidden">
            <PanelHeader action={<BrainCircuit className="size-4 text-accent" />} description="The signed-off allocator memo—not private chain-of-thought." title="Allocation thesis" />
            <div className="p-4">
              <Typography className="max-w-4xl text-muted" variant="body">{envelope.proposal.thesis}</Typography>
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
                  <Typography as="li" className="flex max-w-none gap-3 px-4 py-3 text-muted" key={risk} variant="body">
                    <Typography as="span" className="grid size-5 shrink-0 place-items-center rounded-full bg-warning-soft font-semibold text-warning" variant="caption">{index + 1}</Typography>
                    {risk}
                  </Typography>
                ))}
              </ol>
            </Panel>
            <Panel className="overflow-hidden">
              <PanelHeader action={<Bot className="size-4 text-accent" />} title="Execution metadata" />
              <PanelContent className="px-3 pb-3 pt-1">
                <DescriptionList>
                  {[
                    ["Provider", envelope.model.provider],
                    ["Model", envelope.model.modelId],
                    ["Prompt", envelope.prompt.version],
                    ["Temperature", envelope.model.temperature.toString()],
                    ["Sources", envelope.sources.length.toString()],
                    ["Reasoning CID", decision.reasoningCid],
                  ].flatMap(([label, value]) => [
                    <DescriptionTerm key={`${label}-term`}>{label}</DescriptionTerm>,
                    <DescriptionDetails
                      className={label === "Reasoning CID" ? "flex items-center justify-end gap-1.5 [font-variant-numeric:normal]" : "[font-variant-numeric:normal]"}
                      key={`${label}-value`}
                    >
                      <span className="truncate">{value}</span>
                      {label === "Reasoning CID" ? <CopyButton value={value ?? ""} /> : null}
                    </DescriptionDetails>,
                  ])}
                </DescriptionList>
              </PanelContent>
            </Panel>
          </div>

          <Panel className="overflow-hidden">
            <PanelHeader action={<FileText className="size-4 text-muted" />} description="Hashes make the input corpus tamper-evident after collection." title="Source evidence" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Content hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {envelope.sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="whitespace-normal">
                      <TableLeadCell
                        seed={source.id}
                        subtitle={source.id}
                        title={source.title}
                      />
                    </TableCell>
                    <TableCell className="hidden capitalize text-subtle sm:table-cell">
                      {source.kind.replaceAll("-", " ")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <TablePill>{formatHash(source.contentHash)}</TablePill>
                        <CopyButton value={source.contentHash} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </>
      )}
    </div>
  );
}
