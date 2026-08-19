import {
  hardhatLocal,
  xLayerMainnet,
  xLayerTestnet,
} from "@agentic-rwa/shared";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors/injected";
import { webEnv } from "@/config/env";

export const wagmiConfig = createConfig({
  chains: [hardhatLocal, xLayerTestnet, xLayerMainnet],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  ssr: true,
  transports: {
    [hardhatLocal.id]: http(webEnv.localRpcUrl),
    [xLayerTestnet.id]: http(webEnv.testnetRpcUrl),
    [xLayerMainnet.id]: http(webEnv.mainnetRpcUrl),
  },
});
