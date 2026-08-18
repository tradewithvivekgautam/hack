"use client";

import { DEFAULT_POLICY, evaluatePolicy, type AllocationWeights } from "@agentic-rwa/shared";
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldX } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatBps } from "@/lib/format";

const current: AllocationWeights = { rwa: 5_500, lending: 3_000, idle: 1_500 };
const safe: AllocationWeights = { rwa: 5_200, lending: 3_200, idle: 1_600 };
const malicious: AllocationWeights = { rwa: 8_000, lending: 1_000, idle: 1_000 };
const excessiveTurnover: AllocationWeights = { rwa: 3_000, lending: 3_000, idle: 4_000 };

export function PolicySimulator() {
  const [proposed, setProposed] = useState<AllocationWeights>(safe);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [now] = useState(() => Math.floor(Date.now() / 1_000));
  const evaluation = useMemo(() => evaluatePolicy({
    current,
    proposed,
    policy: DEFAULT_POLICY,
    nowUnixSeconds: now,
    lastRebalanceAtUnixSeconds: cooldownActive ? now - 600 : now - DEFAULT_POLICY.cooldownSeconds - 1,
  }), [proposed, cooldownActive, now]);
  const sum = proposed.rwa + proposed.lending + proposed.idle;

  const update = (strategy: keyof AllocationWeights, value: string) => {
    const numeric = Math.max(0, Math.min(10_000, Number.parseInt(value || "0", 10) || 0));
    setProposed((previous) => ({ ...previous, [strategy]: numeric }));
  };

  return (
    <Panel className="overflow-hidden" id="policy-simulator">
      <PanelHeader
        action={<Badge className={evaluation.accepted ? "border-success/20 bg-success-soft text-success" : "border-danger/20 bg-danger-soft text-danger"}>{evaluation.accepted ? <CheckCircle2 className="size-3" /> : <ShieldX className="size-3" />}{evaluation.accepted ? "Accepted" : "Rejected"}</Badge>}
        description="This TypeScript pre-check shares test vectors with AllocationPolicy.sol. The contract repeats every check before funds move."
        title="Policy simulator"
      />
      <div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["rwa", "lending", "idle"] as const).map((strategy) => (
              <label className="grid gap-1.5" key={strategy}>
                <span className="text-xs font-medium capitalize text-muted">{strategy} weight</span>
                <div className="relative">
                  <Input className="pr-8 number-tabular" max={10_000} min={0} onChange={(event) => update(strategy, event.target.value)} step={100} type="number" value={proposed[strategy]} />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-subtle">bps</span>
                </div>
                <ProgressBar indicatorClassName={proposed[strategy] > DEFAULT_POLICY.maxWeightBps ? "bg-danger" : undefined} value={proposed[strategy] / 100} />
                <span className="text-xs text-subtle">{formatBps(proposed[strategy])}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => { setProposed(safe); setCooldownActive(false); }} size="sm">Safe proposal</Button>
            <Button onClick={() => { setProposed(malicious); setCooldownActive(false); }} size="sm" variant="danger">80% malicious cap</Button>
            <Button onClick={() => { setProposed(excessiveTurnover); setCooldownActive(false); }} size="sm" variant="danger">25% turnover</Button>
            <Button onClick={() => { setProposed(safe); setCooldownActive(true); }} size="sm" variant="danger">Cooldown attack</Button>
            <Button leadingIcon={<RotateCcw className="size-3.5" />} onClick={() => { setProposed(current); setCooldownActive(false); }} size="sm" variant="ghost">Reset</Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-[0.625rem] bg-soft px-2.5 py-2"><div className="text-xs uppercase tracking-[0.06em] text-subtle">Weight sum</div><div className={sum === 10_000 ? "mt-1 text-xs font-semibold text-success" : "mt-1 text-xs font-semibold text-danger"}>{sum.toLocaleString()} bps</div></div>
            <div className="rounded-[0.625rem] bg-soft px-2.5 py-2"><div className="text-xs uppercase tracking-[0.06em] text-subtle">Turnover</div><div className={evaluation.turnoverBps <= DEFAULT_POLICY.maxTurnoverBps ? "mt-1 text-xs font-semibold text-success" : "mt-1 text-xs font-semibold text-danger"}>{formatBps(evaluation.turnoverBps)}</div></div>
            <div className="rounded-[0.625rem] bg-soft px-2.5 py-2"><div className="text-xs uppercase tracking-[0.06em] text-subtle">Cooldown</div><div className={cooldownActive ? "mt-1 text-xs font-semibold text-danger" : "mt-1 text-xs font-semibold text-success"}>{cooldownActive ? "Active" : "Elapsed"}</div></div>
          </div>
        </div>
        <div className={evaluation.accepted ? "rounded-[0.875rem] border border-success/20 bg-success-soft p-3" : "rounded-[0.875rem] border border-danger/20 bg-danger-soft p-3"}>
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">{evaluation.accepted ? <CheckCircle2 className="size-4 text-success" /> : <AlertTriangle className="size-4 text-danger" />}{evaluation.accepted ? "Proposal can proceed" : "Contract will revert"}</div>
          <p className="mt-2 text-xs leading-4 text-muted">{evaluation.accepted ? "The proposal remains inside every deterministic bound. The agent would next preflight the live contract, pin and read back the memo, simulate the exact CID, and submit the atomic rebalance." : "No adapter withdrawal or deposit occurs. The registry remains unchanged because validation executes first."}</p>
          <div className="mt-3 grid gap-2">
            {evaluation.violations.length ? evaluation.violations.map((violation) => <div className="rounded-[0.5rem] border border-danger/15 bg-surface/70 p-2" key={`${violation.code}-${violation.strategyId ?? "all"}`}><div className="text-xs font-semibold uppercase tracking-[0.06em] text-danger">{violation.code.replaceAll("_", " ")}</div><p className="mt-1 text-xs leading-4 text-muted">{violation.message}</p></div>) : <div className="rounded-[0.5rem] border border-success/15 bg-surface/70 p-2 text-xs leading-4 text-muted">All three strategy identities are fixed, weights sum to 10,000 bps, no sleeve exceeds 60%, turnover is at most 20%, and the one-hour cooldown has elapsed.</div>}
          </div>
        </div>
      </div>
    </Panel>
  );
}
