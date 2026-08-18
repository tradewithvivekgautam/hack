import { STRATEGY_IDS, STRATEGY_METADATA, type ReasoningEnvelope } from "@agentic-rwa/shared";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatBps } from "@/lib/format";

export function DecisionAllocationTable({ envelope }: { envelope: ReasoningEnvelope }) {
  return (
    <div className="divide-y divide-line">
      {STRATEGY_IDS.map((strategyId) => {
        const allocation = envelope.proposal.allocations[strategyId];
        return (
          <div className="grid gap-3 px-4 py-3 lg:grid-cols-[10rem_8rem_minmax(0,1fr)]" key={strategyId}>
            <div>
              <div className="text-xs font-semibold text-ink">{STRATEGY_METADATA[strategyId].label}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-semibold text-ink number-tabular">{formatBps(allocation.weightBps)}</span>
                <Badge className="h-4 px-1.5 text-xs">Cap {formatBps(envelope.policy.maxWeightBps)}</Badge>
              </div>
              <ProgressBar className="mt-2 max-w-28" value={allocation.weightBps / 100} />
            </div>
            <div className="text-xs text-subtle">
              <div>Previous</div>
              <div className="mt-1 font-medium text-muted number-tabular">{formatBps(envelope.currentWeights[strategyId])}</div>
              <div className="mt-1">{allocation.weightBps >= envelope.currentWeights[strategyId] ? "+" : ""}{formatBps(allocation.weightBps - envelope.currentWeights[strategyId])}</div>
            </div>
            <div>
              <p className="text-xs leading-5 text-muted">{allocation.rationale}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allocation.evidence.map((evidence) => <Badge key={`${strategyId}-${evidence.sourceId}`}>{evidence.sourceId}</Badge>)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
