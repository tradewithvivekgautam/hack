import {
  AllocationWeightsSchema,
  assertPolicyAccepted,
  DEFAULT_POLICY,
  evaluatePolicy,
  type AllocationWeights,
  type MarketSnapshot,
} from "@agentic-rwa/shared";
import {
  getAddress,
  keccak256,
  stringToHex,
  zeroHash,
  type Hex,
} from "viem";
import type {
  ChainDecision,
  ChainGateway,
  ChainSnapshot,
} from "../domain/ports.js";

const fixtureVault = getAddress("0x1952000000000000000000000000000000000001");
const fixtureAgent = getAddress("0x19520000000000000000000000000000000000a1");
const fixtureAssets = 438_250n * 10n ** 6n;

function fixtureHash(label: string): Hex {
  return keccak256(stringToHex(`fixture:${label}`));
}

function initialHistory(): ChainDecision[] {
  const now = Math.floor(Date.now() / 1_000);
  return [
    { epoch: 67, weights: { rwa: 4_200, lending: 3_800, idle: 2_000 } },
    { epoch: 68, weights: { rwa: 4_300, lending: 3_700, idle: 2_000 } },
    { epoch: 69, weights: { rwa: 4_300, lending: 3_600, idle: 2_100 } },
    { epoch: 70, weights: { rwa: 4_400, lending: 3_500, idle: 2_100 } },
    { epoch: 71, weights: { rwa: 4_500, lending: 3_500, idle: 2_000 } },
  ].map((row, index) => ({
    epoch: row.epoch,
    timestamp: now - (5 - index) * 7_200,
    weights: row.weights,
    reasoningHash: fixtureHash(`reasoning-${row.epoch}`),
    reasoningCid: `fixture-cid-${row.epoch}`,
    agent: fixtureAgent,
    totalAssets: fixtureAssets,
  }));
}

export class FixtureChainGateway implements ChainGateway {
  private weights: AllocationWeights = {
    rwa: 4_500,
    lending: 3_500,
    idle: 2_000,
  };
  private epoch = 71;
  private lastRebalanceAt = 0;
  private readonly decisions = initialHistory();

  async snapshot(): Promise<ChainSnapshot> {
    const observedAt = new Date().toISOString();
    const market: MarketSnapshot = {
      totalAssets: fixtureAssets.toString(),
      adapters: [
        { strategyId: "rwa", assets: "197212500000", apyBps: 820 },
        { strategyId: "lending", assets: "153387500000", apyBps: 490 },
        { strategyId: "idle", assets: "87650000000", apyBps: 0 },
      ],
      okxExitLiquidity: {
        available: true,
        notionalUsd: 100_000,
        estimatedPriceImpactBps: 28,
        observedAt,
      },
    };

    return {
      chainId: 1952,
      vault: fixtureVault,
      totalAssets: fixtureAssets,
      currentWeights: this.weights,
      lastRebalanceAt: this.lastRebalanceAt,
      policy: DEFAULT_POLICY,
      market,
      recentDecisions: this.decisions.slice(-5),
    };
  }

  async simulateRebalance(
    weights: AllocationWeights,
    reasoningHash: Hex,
    reasoningCid: string,
  ): Promise<void> {
    const parsedWeights = AllocationWeightsSchema.parse(weights);
    if (reasoningHash === zeroHash) {
      throw new Error("Reasoning hash must not be zero.");
    }
    if (reasoningCid.trim().length === 0) {
      throw new Error("Reasoning CID must not be empty.");
    }

    assertPolicyAccepted(
      evaluatePolicy({
        current: this.weights,
        proposed: parsedWeights,
        policy: DEFAULT_POLICY,
        nowUnixSeconds: Math.floor(Date.now() / 1_000),
        lastRebalanceAtUnixSeconds: this.lastRebalanceAt,
      }),
    );
  }

  async submitRebalance(
    weights: AllocationWeights,
    reasoningHash: Hex,
    reasoningCid: string,
  ) {
    await this.simulateRebalance(weights, reasoningHash, reasoningCid);
    this.weights = AllocationWeightsSchema.parse(weights);
    this.lastRebalanceAt = Math.floor(Date.now() / 1_000);
    this.epoch += 1;
    const txHash = fixtureHash(`transaction-${this.epoch}`);
    this.decisions.push({
      epoch: this.epoch,
      timestamp: this.lastRebalanceAt,
      weights: this.weights,
      reasoningHash,
      reasoningCid,
      agent: fixtureAgent,
      totalAssets: fixtureAssets,
    });
    return { txHash, epoch: this.epoch };
  }
}
