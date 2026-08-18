import type { AgentConfig } from "../config/env.js";
import type { ChainGateway } from "../domain/ports.js";
import { FixtureChainGateway } from "./fixture-gateway.js";
import { ViemChainGateway } from "./viem-gateway.js";

export function createChainGateway(config: AgentConfig): ChainGateway {
  return config.chain.mode === "fixture" ? new FixtureChainGateway() : new ViemChainGateway(config.chain);
}
