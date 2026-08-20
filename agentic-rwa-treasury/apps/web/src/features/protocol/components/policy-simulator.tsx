"use client";

import { DEFAULT_POLICY, evaluatePolicy, type AllocationWeights } from "@agentic-rwa/shared";
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldX } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DescriptionDetails,
  DescriptionDetailsStack,
  DescriptionDetailsSubrow,
  DescriptionList,
  DescriptionTerm,
} from "@/components/description-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelContent } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatBps } from "@/lib/format";

const current: AllocationWeights = { rwa: 5_500, lending: 3_000, idle: 1_500 };
const safe: AllocationWeights = { rwa: 5_200, lending: 3_200, idle: 1_600 };
const malicious: AllocationWeights = { rwa: 8_000, lending: 1_000, idle: 1_000 };
const excessiveTurnover: AllocationWeights = { rwa: 3_000, lending: 3_000, idle: 4_000 };

export function PolicySimulator() {
  const [proposed, setProposed] = useState<AllocationWeights>(safe);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [now] = useState(() => Math.floor(Date.now() / 1_000));
  const evaluation = useMemo(
    () =>
      evaluatePolicy({
        current,
        proposed,
        policy: DEFAULT_POLICY,
        nowUnixSeconds: now,
        lastRebalanceAtUnixSeconds: cooldownActive
          ? now - 600
          : now - DEFAULT_POLICY.cooldownSeconds - 1,
      }),
    [proposed, cooldownActive, now],
  );
  const sum = proposed.rwa + proposed.lending + proposed.idle;
  const sumOk = sum === 10_000;
  const turnoverOk = evaluation.turnoverBps <= DEFAULT_POLICY.maxTurnoverBps;
  const cooldownOk = !cooldownActive;

  const update = (strategy: keyof AllocationWeights, value: string) => {
    const numeric = Math.max(
      0,
      Math.min(10_000, Number.parseInt(value || "0", 10) || 0),
    );
    setProposed((previous) => ({ ...previous, [strategy]: numeric }));
  };

  return (
    <Panel className="overflow-hidden" id="policy-simulator">
      <PanelContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <Typography className="text-muted" variant="ui">
              TypeScript pre-check shares test vectors with AllocationPolicy.sol.
            </Typography>
            <Badge
              className={
                evaluation.accepted
                  ? "border-success/20 bg-success-soft text-success"
                  : "border-danger/20 bg-danger-soft text-danger"
              }
            >
              {evaluation.accepted ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <ShieldX className="size-3" />
              )}
              {evaluation.accepted ? "Accepted" : "Rejected"}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(["rwa", "lending", "idle"] as const).map((strategy) => (
              <label className="grid gap-1.5" key={strategy}>
                <Typography
                  as="span"
                  className="font-medium capitalize text-muted"
                  variant="caption"
                >
                  {strategy} weight
                </Typography>
                <div className="relative">
                  <Input
                    className="number-tabular pr-8"
                    max={10_000}
                    min={0}
                    onChange={(event) => update(strategy, event.target.value)}
                    step={100}
                    type="number"
                    value={proposed[strategy]}
                  />
                  <Typography
                    as="span"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle"
                    variant="caption"
                  >
                    bps
                  </Typography>
                </div>
                <ProgressBar
                  {...(proposed[strategy] > DEFAULT_POLICY.maxWeightBps
                    ? { indicatorClassName: "bg-danger" }
                    : {})}
                  value={proposed[strategy] / 100}
                />
                <Typography as="span" className="text-subtle" variant="caption">
                  {formatBps(proposed[strategy])}
                </Typography>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setProposed(safe);
                setCooldownActive(false);
              }}
              size="sm"
            >
              Safe proposal
            </Button>
            <Button
              onClick={() => {
                setProposed(malicious);
                setCooldownActive(false);
              }}
              size="sm"
              variant="danger"
            >
              80% malicious cap
            </Button>
            <Button
              onClick={() => {
                setProposed(excessiveTurnover);
                setCooldownActive(false);
              }}
              size="sm"
              variant="danger"
            >
              25% turnover
            </Button>
            <Button
              onClick={() => {
                setProposed(safe);
                setCooldownActive(true);
              }}
              size="sm"
              variant="danger"
            >
              Cooldown attack
            </Button>
            <Button
              leadingIcon={<RotateCcw className="size-3.5" />}
              onClick={() => {
                setProposed(current);
                setCooldownActive(false);
              }}
              size="sm"
              variant="ghost"
            >
              Reset
            </Button>
          </div>
        </div>

        <div
          className={
            evaluation.accepted
              ? "rounded-[0.75rem] border border-success/20 bg-success-soft p-3"
              : "rounded-[0.75rem] border border-danger/20 bg-danger-soft p-3"
          }
        >
          <Typography
            as="h2"
            className="flex items-center gap-2 text-ink"
            variant="title"
          >
            {evaluation.accepted ? (
              <CheckCircle2 className="size-4 text-success" />
            ) : (
              <AlertTriangle className="size-4 text-danger" />
            )}
            {evaluation.accepted ? "Proposal can proceed" : "Contract will revert"}
          </Typography>
          <Typography className="mt-2 text-muted" variant="body">
            {evaluation.accepted
              ? "Inside every deterministic bound. Next: preflight, pin/read-back, simulate, submit."
              : "Validation runs first. No adapter movement, registry unchanged."}
          </Typography>

          <div className="mt-3 rounded-[0.625rem] border border-line/70 bg-surface/80 px-3 py-2">
            <Typography className="pb-1 text-subtle" variant="label">
              Contract bounds
            </Typography>
            <DescriptionList>
              <DescriptionTerm>Strategy cap</DescriptionTerm>
              <DescriptionDetails>
                {formatBps(DEFAULT_POLICY.maxWeightBps)}
              </DescriptionDetails>
              <DescriptionTerm>Turnover limit</DescriptionTerm>
              <DescriptionDetails>
                {formatBps(DEFAULT_POLICY.maxTurnoverBps)}
              </DescriptionDetails>
              <DescriptionTerm>Cooldown</DescriptionTerm>
              <DescriptionDetails className="[font-variant-numeric:normal]">
                1 hour
              </DescriptionDetails>
            </DescriptionList>
          </div>

          <div className="mt-3 rounded-[0.625rem] border border-line/70 bg-surface/80 px-3 py-2">
            <Typography className="pb-1 text-subtle" variant="label">
              This proposal
            </Typography>
            <DescriptionList>
              <DescriptionTerm>Weight sum</DescriptionTerm>
              <DescriptionDetails className={cn(!sumOk && "text-danger")}>
                {sum.toLocaleString()} bps
              </DescriptionDetails>
              <DescriptionTerm>Turnover</DescriptionTerm>
              <DescriptionDetails className={cn(!turnoverOk && "text-danger")}>
                {formatBps(evaluation.turnoverBps)}
              </DescriptionDetails>
              <DescriptionTerm>Cooldown</DescriptionTerm>
              <DescriptionDetails
                className={cn(
                  "[font-variant-numeric:normal]",
                  !cooldownOk ? "text-danger" : "text-success",
                )}
              >
                {cooldownActive ? "Active" : "Elapsed"}
              </DescriptionDetails>
              <DescriptionTerm>Max sleeve</DescriptionTerm>
              <DescriptionDetails>
                <DescriptionDetailsStack>
                  <DescriptionDetailsSubrow label="RWA">
                    {formatBps(proposed.rwa)}
                  </DescriptionDetailsSubrow>
                  <DescriptionDetailsSubrow label="Lending">
                    {formatBps(proposed.lending)}
                  </DescriptionDetailsSubrow>
                  <DescriptionDetailsSubrow label="Idle">
                    {formatBps(proposed.idle)}
                  </DescriptionDetailsSubrow>
                </DescriptionDetailsStack>
              </DescriptionDetails>
            </DescriptionList>
          </div>

          <div className="mt-3 grid gap-2">
            {evaluation.violations.length ? (
              evaluation.violations.map((violation) => (
                <div
                  className="rounded-[0.5rem] border border-danger/15 bg-surface p-2.5"
                  key={`${violation.code}-${violation.strategyId ?? "all"}`}
                >
                  <Typography as="div" className="text-danger" variant="label">
                    {violation.code.replaceAll("_", " ")}
                  </Typography>
                  <Typography className="mt-1 text-muted" variant="body">
                    {violation.message}
                  </Typography>
                </div>
              ))
            ) : (
              <Typography
                as="div"
                className="rounded-[0.5rem] border border-success/15 bg-surface p-2.5 text-muted"
                variant="body"
              >
                Fixed strategies, exact weight sum, cap, turnover, and cooldown
                all pass.
              </Typography>
            )}
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
