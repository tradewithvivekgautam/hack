"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { assertLiveConfiguration, webEnv } from "@/config/env";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";
import { demoCurrentWeights, demoTargetWeights } from "@/lib/demo/vault";
import {
  createVaultSnapshot,
  fetchLiveVaultSnapshot,
  strategyAssetsFromWeights,
} from "./vault-query";

export const vaultQueryKey = ["vault", "snapshot"] as const;

export function useVaultSnapshot() {
  const demo = useDemoTreasury();
  const account = useAccount();
  const client = usePublicClient({ chainId: webEnv.defaultChainId });
  const isDemo = webEnv.appMode === "demo";

  return useQuery({
    queryKey: [
      ...vaultQueryKey,
      isDemo ? "demo" : "live",
      isDemo ? `${demo.version}:${demo.connected}` : account.address,
    ],
    queryFn: async () => {
      if (isDemo) {
        const strategyAssets = strategyAssetsFromWeights(
          demo.totalAssets,
          demoCurrentWeights,
        );
        return createVaultSnapshot({
          mode: "demo",
          totalAssets: demo.totalAssets,
          totalSupply: demo.totalSupply,
          userAssetBalance: demo.connected ? demo.walletAssets : 0n,
          userShareBalance: demo.connected ? demo.shares : 0n,
          currentWeights: demoCurrentWeights,
          targetWeights: demoTargetWeights,
          strategyAssets,
          strategyApys: [760, 510, 0],
          weightedApyBps: 571,
          lastRebalanceAt: Math.floor(
            Date.parse("2026-08-14T09:00:00.000Z") / 1_000,
          ),
          paused: false,
        });
      }

      assertLiveConfiguration();
      if (!client) throw new Error("X Layer RPC client is unavailable.");
      return fetchLiveVaultSnapshot({
        client,
        vault: webEnv.contracts.vault,
        asset: webEnv.contracts.asset,
        ...(account.address ? { user: account.address } : {}),
      });
    },
    staleTime: isDemo ? Number.POSITIVE_INFINITY : 15_000,
    refetchInterval: isDemo ? false : 30_000,
  });
}
