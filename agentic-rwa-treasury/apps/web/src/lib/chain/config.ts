import {
  hardhatLocal,
  xLayerMainnet,
  xLayerTestnet,
} from "@agentic-rwa/shared";
import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { webEnv } from "@/config/env";

export const wagmiConfig = createConfig({
  chains: [hardhatLocal, xLayerTestnet, xLayerMainnet],
  connectors: [
    injected({ shimDisconnect: true }),
    ...(webEnv.walletConnectProjectId
      ? [walletConnect({ projectId: webEnv.walletConnectProjectId })]
      : []),
  ],
  ssr: true,
  transports: {
    [hardhatLocal.id]: http(webEnv.localRpcUrl),
    [xLayerTestnet.id]: http(webEnv.testnetRpcUrl),
    [xLayerMainnet.id]: http(webEnv.mainnetRpcUrl),
  },
});
