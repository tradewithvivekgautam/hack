import { chainById, hardhatLocal, xLayerMainnet } from "@agentic-rwa/shared";
import { createPublicClient, http } from "viem";
import { webEnv } from "@/config/env";

function rpcUrl(chainId: number): string {
  if (chainId === hardhatLocal.id) return webEnv.localRpcUrl;
  if (chainId === xLayerMainnet.id) return webEnv.mainnetRpcUrl;
  return webEnv.testnetRpcUrl;
}

export function publicClient(chainId = webEnv.defaultChainId) {
  const chain = chainById(chainId);
  return createPublicClient({ chain, transport: http(rpcUrl(chain.id)) });
}
