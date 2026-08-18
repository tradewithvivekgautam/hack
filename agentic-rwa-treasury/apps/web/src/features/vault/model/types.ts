import type { AllocationWeights, StrategyId } from "@agentic-rwa/shared";

export type StrategyPosition = {
  id: StrategyId;
  name: string;
  description: string;
  assets: bigint;
  weightBps: number;
  targetWeightBps: number;
  apyBps: number;
  status: "active" | "reserve";
};

export type VaultSnapshot = {
  mode: "demo" | "live";
  totalAssets: bigint;
  totalSupply: bigint;
  sharePrice: number;
  weightedApyBps: number;
  userAssetBalance: bigint;
  userShareBalance: bigint;
  userPositionAssets: bigint;
  currentWeights: AllocationWeights;
  targetWeights: AllocationWeights;
  strategies: readonly StrategyPosition[];
  lastRebalanceAt: number;
  nextRebalanceAt: number;
  paused: boolean;
};
