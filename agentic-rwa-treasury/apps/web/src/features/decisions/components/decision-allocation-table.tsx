import { Activity, CircleDollarSign, Landmark } from "lucide-react";
import { STRATEGY_IDS, STRATEGY_METADATA, type ReasoningEnvelope } from "@agentic-rwa/shared";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableLeadCell, TableStackedMetric } from "@/components/ui/table-cells";
import { Typography } from "@/components/ui/typography";
import { formatBps } from "@/lib/format";

const strategyIcons = {
  rwa: Landmark,
  lending: Activity,
  idle: CircleDollarSign,
} as const;

export function DecisionAllocationTable({ envelope }: { envelope: ReasoningEnvelope }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Strategy</TableHead>
          <TableHead className="hidden sm:table-cell">Previous</TableHead>
          <TableHead>Proposed</TableHead>
          <TableHead className="hidden lg:table-cell">Rationale and evidence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      {STRATEGY_IDS.map((strategyId) => {
        const allocation = envelope.proposal.allocations[strategyId];
        const Icon = strategyIcons[strategyId];
        return (
          <TableRow key={strategyId}>
            <TableCell>
              <TableLeadCell
                icon={Icon}
                seed={strategyId}
                subtitle={STRATEGY_METADATA[strategyId].description}
                title={STRATEGY_METADATA[strategyId].label}
              />
            </TableCell>
            <TableCell className="hidden number-tabular sm:table-cell">
              <TableStackedMetric
                primary={formatBps(envelope.currentWeights[strategyId])}
                secondary={`${allocation.weightBps >= envelope.currentWeights[strategyId] ? "+" : ""}${formatBps(allocation.weightBps - envelope.currentWeights[strategyId])}`}
              />
            </TableCell>
            <TableCell className="min-w-[8.5rem]">
              <div className="flex items-center gap-2">
                <span className="font-medium text-ink">{formatBps(allocation.weightBps)}</span>
                <Badge className="h-4 px-1.5">Cap {formatBps(envelope.policy.maxWeightBps)}</Badge>
              </div>
              <ProgressBar className="mt-1.5 max-w-28" value={allocation.weightBps / 100} />
            </TableCell>
            <TableCell className="hidden min-w-[18rem] whitespace-normal lg:table-cell">
              <Typography className="text-muted" variant="body">{allocation.rationale}</Typography>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {allocation.evidence.map((evidence) => <Badge key={`${strategyId}-${evidence.sourceId}`}>{evidence.sourceId}</Badge>)}
              </div>
            </TableCell>
          </TableRow>
        );
      })}
      </TableBody>
    </Table>
  );
}
