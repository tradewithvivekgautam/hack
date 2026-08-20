import {
  hardhatLocal,
  xLayerMainnet,
  xLayerTestnet,
} from "@agentic-rwa/shared";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  okxWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { webEnv } from "@/config/env";

export const appChains = [xLayerTestnet, xLayerMainnet, hardhatLocal] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "Arca",
  appDescription:
    "Agentic RWA treasury with deterministic policy and on-chain custody.",
  batch: {
    [hardhatLocal.id]: {
      multicall: {
        deployless: true,
      },
    },
  },
  chains: [...appChains],
  projectId:
    webEnv.walletConnectProjectId ?? "missing-walletconnect-project-id",
  ssr: true,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [okxWallet],
    },
    {
      groupName: "Other",
      wallets: [walletConnectWallet, injectedWallet],
    },
  ],
  transports: {
    [hardhatLocal.id]: http(webEnv.localRpcUrl),
    [xLayerTestnet.id]: http(webEnv.testnetRpcUrl),
    [xLayerMainnet.id]: http(webEnv.mainnetRpcUrl),
  },
});
