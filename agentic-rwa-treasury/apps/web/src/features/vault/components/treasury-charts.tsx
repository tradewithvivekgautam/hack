"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DistributionBar } from "@/components/ui/category-bar";
import { Panel, PanelContent, PanelHeader } from "@/components/ui/panel";
import type { DecisionRecord } from "@/features/decisions/model/types";
import { formatBps } from "@/lib/format";
import type { VaultSnapshot } from "../model/types";

const series = [
  { key: "rwa", label: "RWA", color: "var(--color-accent)", barClass: "bg-accent" },
  { key: "lending", label: "Lending", color: "var(--color-category-blue)", barClass: "bg-category-blue" },
  { key: "idle", label: "Idle", color: "var(--color-category-green)", barClass: "bg-category-green" },
] as const;

const tooltipStyle = {
  border: "0.0625rem solid var(--color-line)",
  borderRadius: "0.625rem",
  background: "var(--color-surface)",
  boxShadow: "var(--shadow-surface)",
  color: "var(--color-ink)",
  fontSize: "0.75rem",
} as const;

export function TreasuryDistributionChart({ snapshot }: { snapshot: VaultSnapshot }) {
  const segments = series.map((item) => ({
    label: item.label,
    value: snapshot.currentWeights[item.key],
    colorClassName: item.barClass,
    detail: formatBps(snapshot.currentWeights[item.key]),
  }));

  return (
    <Panel className="overflow-hidden">
      <PanelHeader description="Current contract-reported portfolio weights." title="Distribution" />
      <PanelContent className="pt-2">
        <DistributionBar segments={segments} />
      </PanelContent>
    </Panel>
  );
}

export function TreasuryHistoryChart({ decisions }: { decisions: readonly DecisionRecord[] }) {
  const data = [...decisions].reverse().map((decision) => ({
    epoch: decision.epoch,
    label: new Date(decision.timestamp).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    rwa: decision.weights.rwa / 100,
    lending: decision.weights.lending / 100,
    idle: decision.weights.idle / 100,
  }));

  return (
    <Panel className="overflow-hidden">
      <PanelHeader description={`${data.length} contract-recorded allocation epochs.`} title="Allocation history" />
      <div className="h-64 px-2 pb-3 pt-3" aria-label="Allocation history chart">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ bottom: 0, left: -18, right: 10, top: 4 }}>
            <defs>
              {series.map((item) => (
                <linearGradient id={`fill-${item.key}`} key={item.key} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={item.color} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={item.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="2 4" vertical={false} />
            <XAxis axisLine={false} dataKey="label" minTickGap={42} tick={{ fill: "var(--color-subtle)", fontSize: 11 }} tickLine={false} />
            <YAxis axisLine={false} domain={[0, 70]} tick={{ fill: "var(--color-subtle)", fontSize: 11 }} tickFormatter={(value) => `${value}%`} tickLine={false} width={45} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toFixed(1)}%`} labelFormatter={(_, payload) => payload[0]?.payload ? `Epoch ${payload[0].payload.epoch}` : ""} />
            {series.map((item) => (
              <Area dataKey={item.key} fill={`url(#fill-${item.key})`} key={item.key} name={item.label} stroke={item.color} strokeWidth={2} type="monotone" />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
