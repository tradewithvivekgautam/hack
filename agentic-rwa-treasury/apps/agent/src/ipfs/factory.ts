import type { AgentConfig } from "../config/env.js";
import type { ReasoningStore } from "../domain/ports.js";
import { LocalReasoningStore } from "./local-store.js";
import { PinataReasoningStore } from "./pinata-store.js";

export function createReasoningStore(config: AgentConfig): ReasoningStore {
  return config.ipfs.provider === "local"
    ? new LocalReasoningStore(config.ipfs.localDirectory)
    : new PinataReasoningStore(config.ipfs.pinataJwt);
}
