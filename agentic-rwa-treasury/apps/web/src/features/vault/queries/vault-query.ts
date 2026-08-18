import {
  STRATEGY_IDS,
  STRATEGY_METADATA,
  erc20Abi,
  tupleToAllocation,
  vaultAbi,
  type AllocationWeights,
} from "@agentic-rwa/shared";
import type { Address, PublicClient } from "viem";
import type { VaultSnapshot } from "../model/types";

const HOUR_SECONDS = 3_600;

export function strategyAssetsFromWeights(totalAssets: bigint, weights: AllocationWeights) {
  const rwa = (totalAssets * BigInt(weights.rwa)) / 10_000n;
  const lending = (totalAssets * BigInt(weights.lending)) / 10_000n;
  return [rwa, lending, totalAssets - rwa - lending] as const;
}

export function createVaultSnapshot(input: {
  mode: "demo" | "live";
  totalAssets: bigint;
  totalSupply: bigint;
  userAssetBalance: bigint;
  userShareBalance: bigint;
  currentWeights: AllocationWeights;
  targetWeights: AllocationWeights;
  strategyAssets: readonly [bigint, bigint, bigint];
  strategyApys: readonly [number, number, number];
  weightedApyBps: number;
  lastRebalanceAt: number;
  paused: boolean;
}): VaultSnapshot {
  const userPositionAssets =
    input.totalSupply === 0n ? 0n : (input.userShareBalance * input.totalAssets) / input.totalSupply;
  const sharePrice =
    input.totalSupply === 0n ? 1 : Number((input.totalAssets * 1_000_000n) / input.totalSupply) / 1_000_000;

  return {
    mode: input.mode,
    totalAssets: input.totalAssets,
    totalSupply: input.totalSupply,
    sharePrice,
    weightedApyBps: input.weightedApyBps,
    userAssetBalance: input.userAssetBalance,
    userShareBalance: input.userShareBalance,
    userPositionAssets,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    strategies: STRATEGY_IDS.map((id, index) => ({
      id,
      name: STRATEGY_METADATA[id].label,
      description: STRATEGY_METADATA[id].description,
      assets: input.strategyAssets[index] ?? 0n,
      weightBps: input.currentWeights[id],
      targetWeightBps: input.targetWeights[id],
      apyBps: input.strategyApys[index] ?? 0,
      status: id === "idle" ? "reserve" : "active",
    })),
    lastRebalanceAt: input.lastRebalanceAt,
    nextRebalanceAt: input.lastRebalanceAt + HOUR_SECONDS,
    paused: input.paused,
  };
}

function numbersFromTuple(tuple: readonly unknown[]): readonly [number, number, number] {
  return [Number(tuple[0] ?? 0), Number(tuple[1] ?? 0), Number(tuple[2] ?? 0)];
}

export async function fetchLiveVaultSnapshot(input: {
  client: PublicClient;
  vault: Address;
  asset: Address;
  user?: Address;
}): Promise<VaultSnapshot> {
  const contracts = [
    { address: input.vault, abi: vaultAbi, functionName: "totalAssets" },
    { address: input.vault, abi: vaultAbi, functionName: "totalSupply" },
    { address: input.vault, abi: vaultAbi, functionName: "currentWeights" },
    { address: input.vault, abi: vaultAbi, functionName: "targetWeights" },
    { address: input.vault, abi: vaultAbi, functionName: "strategyAssets" },
    { address: input.vault, abi: vaultAbi, functionName: "strategyApys" },
    { address: input.vault, abi: vaultAbi, functionName: "weightedApyBps" },
    { address: input.vault, abi: vaultAbi, functionName: "lastRebalanceAt" },
    { address: input.vault, abi: vaultAbi, functionName: "paused" },
  ] as const;

  const results = await input.client.multicall({ contracts, allowFailure: false });
  const totalAssets = results[0] as bigint;
  const totalSupply = results[1] as bigint;
  const currentTuple = numbersFromTuple(results[2] as readonly unknown[]);
  const targetTuple = numbersFromTuple(results[3] as readonly unknown[]);
  const assetsTuple = results[4] as readonly [bigint, bigint, bigint];
  const apyTupleRaw = results[5] as readonly unknown[];
  const strategyApys = numbersFromTuple(apyTupleRaw);
  const weightedApyBps = Number(results[6]);
  const lastRebalanceAt = Number(results[7]);
  const paused = Boolean(results[8]);

  let userAssetBalance = 0n;
  let userShareBalance = 0n;
  if (input.user) {
    const balances = await input.client.multicall({
      allowFailure: false,
      contracts: [
        { address: input.asset, abi: erc20Abi, functionName: "balanceOf", args: [input.user] },
        { address: input.vault, abi: vaultAbi, functionName: "balanceOf", args: [input.user] },
      ],
    });
    userAssetBalance = balances[0] as bigint;
    userShareBalance = balances[1] as bigint;
  }

  return createVaultSnapshot({
    mode: "live",
    totalAssets,
    totalSupply,
    userAssetBalance,
    userShareBalance,
    currentWeights: tupleToAllocation(currentTuple),
    targetWeights: tupleToAllocation(targetTuple),
    strategyAssets: assetsTuple,
    strategyApys,
    weightedApyBps,
    lastRebalanceAt,
    paused,
  });
}
