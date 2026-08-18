import { describe, expect, it } from "vitest";
import { canonicalReasoningJson, hashReasoningEnvelope, type ReasoningEnvelope } from "../src/reasoning.js";

const envelope: ReasoningEnvelope = {
  schemaVersion: "1.0.0",
  epochRequestedAt: "2026-08-17T00:00:00.000Z",
  chain: { chainId: 1952, vault: "0x0000000000000000000000000000000000000001" },
  model: { provider: "fixture", modelId: "fixture-v1", temperature: 0, reasoningMode: "enabled" },
  prompt: { version: "allocation-v1", hash: "0x" + "11".repeat(32) },
  policy: { maxWeightBps: 6_000, maxTurnoverBps: 2_000, cooldownSeconds: 3_600 },
  currentWeights: { rwa: 4_500, lending: 3_500, idle: 2_000 },
  market: {
    totalAssets: "100000000000",
    adapters: [
      { strategyId: "rwa", assets: "45000000000", apyBps: 820 },
      { strategyId: "lending", assets: "35000000000", apyBps: 490 },
      { strategyId: "idle", assets: "20000000000", apyBps: 0 },
    ],
    okxExitLiquidity: { available: true, notionalUsd: 100_000, estimatedPriceImpactBps: 28, observedAt: "2026-08-17T00:00:00.000Z" },
  },
  proposal: {
    allocations: {
      rwa: { weightBps: 5_500, rationale: "Stable duration income supports a measured overweight.", evidence: [{ sourceId: "fund", claim: "The factsheet reports stable NAV." }] },
      lending: { weightBps: 3_000, rationale: "Lending remains useful but carries variable utilization risk.", evidence: [{ sourceId: "chain", claim: "Current utilization remains bounded." }] },
      idle: { weightBps: 1_500, rationale: "The reserve preserves immediate redemption capacity.", evidence: [{ sourceId: "liquidity", claim: "Exit impact remains within the monitored range." }] },
    },
    thesis: "The portfolio can add measured RWA exposure while preserving sufficient lending diversification and immediate redemption liquidity.",
    risks: ["Credit spreads can widen before the next scheduled epoch."],
    confidence: "medium",
  },
  sources: [
    { id: "fund", kind: "fund-factsheet", title: "Fund", sourceUrl: "fixture://fund", publishedAt: "2026-08-16T00:00:00.000Z", fetchedAt: "2026-08-17T00:00:00.000Z", contentHash: "0x" + "22".repeat(32), stale: false },
    { id: "chain", kind: "chain-state", title: "Chain", sourceUrl: "fixture://chain", publishedAt: "2026-08-17T00:00:00.000Z", fetchedAt: "2026-08-17T00:00:00.000Z", contentHash: "0x" + "33".repeat(32), stale: false },
    { id: "liquidity", kind: "liquidity", title: "Liquidity", sourceUrl: "fixture://liquidity", publishedAt: "2026-08-17T00:00:00.000Z", fetchedAt: "2026-08-17T00:00:00.000Z", contentHash: "0x" + "44".repeat(32), stale: false },
  ],
};

describe("canonical reasoning", () => {
  it("is deterministic and hashes the exact canonical bytes", () => {
    expect(canonicalReasoningJson(envelope)).toBe(canonicalReasoningJson(structuredClone(envelope)));
    expect(hashReasoningEnvelope(envelope)).toMatch(/^0x[a-f0-9]{64}$/);
  });
});
