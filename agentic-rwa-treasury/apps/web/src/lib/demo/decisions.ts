import { canonicalReasoningJson, hashReasoningEnvelope, hashUtf8Text, ReasoningEnvelopeSchema, type AllocationWeights } from "@agentic-rwa/shared";
import { keccak256, stringToBytes } from "viem";
import type { DecisionRecord } from "@/features/decisions/model/types";

const agent = "0xA93B1454b4A88b453F78F78Db7D9D72618A2B2A1" as const;
const vault = "0xF92d62eDBc7742E50B7D93bfa942BC80B98D2a71" as const;
const start = Date.parse("2026-08-14T00:00:00.000Z");

function weightsFor(epoch: number): AllocationWeights {
  const rwa = 4900 + (epoch * 73) % 600;
  const lending = 2850 + (epoch * 41) % 400;
  return { rwa, lending, idle: 10000 - rwa - lending };
}

export function getDemoDecision(epoch: number): DecisionRecord {
  if (!Number.isInteger(epoch) || epoch < 1 || epoch > 71) throw new Error("Demo epoch not found.");
  const weights = weightsFor(epoch);
  const previous = epoch === 1 ? { rwa: 4_500, lending: 3_500, idle: 2_000 } : weightsFor(epoch - 1);
  const timestamp = new Date(start + (epoch - 1) * 3_600_000).toISOString();
  const confidence = epoch % 7 === 0 ? "low" as const : epoch % 3 === 0 ? "high" as const : "medium" as const;
  const envelope = ReasoningEnvelopeSchema.parse({
    schemaVersion: "1.0.0",
    epochRequestedAt: timestamp,
    chain: { chainId: 1952, vault },
    model: { provider: "modal", modelId: "arca-reasoning-v4", temperature: 0.1, reasoningMode: "enabled" },
    prompt: { version: "allocation-v1.0.0", hash: hashUtf8Text("allocation-v1.0.0") },
    policy: { maxWeightBps: 6000, maxTurnoverBps: 2000, cooldownSeconds: 3600 },
    currentWeights: previous,
    market: {
      totalAssets: (1_200_000_000_000n + BigInt(epoch) * 704_225_352n).toString(),
      adapters: [
        { strategyId: "rwa", assets: "600000000000", apyBps: 518 },
        { strategyId: "lending", assets: "400000000000", apyBps: 510 },
        { strategyId: "idle", assets: "200000000000", apyBps: 0 },
      ],
      okxExitLiquidity: {
        available: true,
        notionalUsd: 100000,
        estimatedPriceImpactBps: 12,
        observedAt: timestamp,
      },
    },
    proposal: {
      allocations: {
        rwa: { weightBps: weights.rwa, rationale: "Short-duration tokenized treasury exposure retains attractive carry and stable reported NAV, but remains below the concentration cap because off-chain redemption and secondary-market liquidity are distinct risks.", evidence: [{ sourceId: "rwa-fund-factsheet", claim: "Indicative net yield is 5.18% with 73-day weighted average maturity and stable reported NAV." }, { sourceId: "okx-liquidity", claim: "Observed exit impact supports a bounded, rather than maximal, RWA allocation." }] },
        lending: { weightBps: weights.lending, rationale: "The lending sleeve provides liquid on-chain yield and diversification while remaining small enough to tolerate utilization and smart-contract stress.", evidence: [{ sourceId: "chain-state", claim: "The lending adapter reports 5.10% modeled APY and sufficient testnet liquidity." }] },
        idle: { weightBps: weights.idle, rationale: "The idle reserve is intentionally maintained to meet withdrawals without forcing a sale from the RWA or lending sleeves during thin liquidity.", evidence: [{ sourceId: "okx-liquidity", claim: "A 100,000 USDC observation showed moderate route depth and non-zero price impact." }] },
      },
      thesis: "Preserve diversified yield exposure while keeping the portfolio readily redeemable. Short-duration RWA carry remains attractive, lending provides a liquid second yield source, and the idle bucket is sized as an explicit response to exit-liquidity and source-freshness risk rather than as unproductive cash.",
      risks: ["Token secondary-market liquidity can diverge from the underlying fund NAV.", "Lending utilization or stablecoin stress can increase withdrawal costs.", ...(confidence === "low" ? ["One source is stale, so the decision retains more risk-off capacity."] : [])],
      confidence,
    },
    sources: [
      { id: "rwa-fund-factsheet", kind: "fund-factsheet", title: "Tokenized Treasury Fund — August 2026", sourceUrl: "fixture://rwa-fund-factsheet", publishedAt: "2026-08-13T00:00:00.000Z", fetchedAt: timestamp, contentHash: `0x${"11".repeat(32)}`, stale: false },
      { id: "okx-liquidity", kind: "liquidity", title: "OKX DEX exit-liquidity quote", sourceUrl: "https://web3.okx.com", publishedAt: timestamp, fetchedAt: timestamp, contentHash: `0x${"22".repeat(32)}`, stale: false },
      { id: "chain-state", kind: "chain-state", title: "Live adapter state", sourceUrl: `https://www.oklink.com/x-layer-test/address/${vault}`, publishedAt: timestamp, fetchedAt: timestamp, contentHash: `0x${"33".repeat(32)}`, stale: false },
    ],
  });
  return {
    epoch,
    timestamp,
    weights,
    reasoningHash: hashReasoningEnvelope(envelope),
    reasoningCid: `demo-epoch-${epoch}`,
    transactionHash: keccak256(stringToBytes(`agentic-rwa-demo-${epoch}`)),
    agent,
    totalAssets: 1_200_000_000_000n + BigInt(epoch) * 704_225_352n,
    confidence,
    modelId: envelope.model.modelId,
    envelope,
    sourceUrl: `/api/ipfs/demo-epoch-${epoch}`,
  };
}

export function getDemoDecisions(): readonly DecisionRecord[] {
  return Array.from({ length: 71 }, (_, index) => getDemoDecision(71 - index));
}

export const demoDecisions = getDemoDecisions();

export function getDemoReasoningText(epoch: number): string {
  const item = getDemoDecision(epoch);
  if (!item.envelope) throw new Error("Envelope unavailable");
  return canonicalReasoningJson(item.envelope);
}

export function getDemoCanonicalJson(cid: string): string {
  const match = /^demo-epoch-(\d{1,3})$/.exec(cid);
  if (!match) throw new Error("Demo reasoning CID not found.");
  return getDemoReasoningText(Number(match[1]));
}
