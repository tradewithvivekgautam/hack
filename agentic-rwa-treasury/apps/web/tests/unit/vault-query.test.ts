import { describe, expect, it } from "vitest";
import { createVaultSnapshot, strategyAssetsFromWeights } from "@/features/vault/queries/vault-query";

const weights = { rwa: 5_500, lending: 3_000, idle: 1_500 } as const;

describe("vault snapshot", () => {
  it("preserves all assets across the strategy split", () => {
    const totalAssets = 10_000_001n;
    const assets = strategyAssetsFromWeights(totalAssets, weights);
    expect(assets[0] + assets[1] + assets[2]).toBe(totalAssets);
  });

  it("prices a user position from ERC-4626 supply", () => {
    const snapshot = createVaultSnapshot({
      mode: "demo",
      totalAssets: 1_100_000n,
      totalSupply: 1_000_000n,
      userAssetBalance: 50_000n,
      userShareBalance: 100_000n,
      currentWeights: weights,
      targetWeights: weights,
      strategyAssets: [605_000n, 330_000n, 165_000n],
      strategyApys: [700, 500, 0],
      weightedApyBps: 535,
      lastRebalanceAt: 100,
      paused: false,
    });
    expect(snapshot.userPositionAssets).toBe(110_000n);
    expect(snapshot.sharePrice).toBe(1.1);
    expect(snapshot.strategies).toHaveLength(3);
  });
});
