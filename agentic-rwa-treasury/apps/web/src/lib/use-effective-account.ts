"use client";

import { useAccount } from "wagmi";
import { webEnv } from "@/config/env";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";

export function useEffectiveAccount() {
  const demo = useDemoTreasury();
  const account = useAccount();
  if (webEnv.appMode === "demo") {
    return {
      address: demo.connected ? demo.address : undefined,
      connected: demo.connected,
      chainId: webEnv.defaultChainId,
      mode: "demo" as const,
    };
  }
  return {
    address: account.address,
    connected: account.isConnected,
    chainId: account.chainId,
    mode: "live" as const,
  };
}
