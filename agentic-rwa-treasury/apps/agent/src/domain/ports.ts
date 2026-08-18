import type {
  AllocationProposal,
  AllocationWeights,
  MarketSnapshot,
  PolicySnapshot,
  ReasoningEnvelope,
  SourceDocument,
} from "@agentic-rwa/shared";
import type { Address, Hex } from "viem";

export type ChainDecision = {
  epoch: number;
  timestamp: number;
  weights: AllocationWeights;
  reasoningHash: Hex;
  reasoningCid: string;
  agent: Address;
  totalAssets: bigint;
};

export type ChainSnapshot = {
  chainId: number;
  vault: Address;
  totalAssets: bigint;
  currentWeights: AllocationWeights;
  lastRebalanceAt: number;
  policy: PolicySnapshot;
  market: MarketSnapshot;
  recentDecisions: readonly ChainDecision[];
};

export type ProviderContext = {
  documents: readonly SourceDocument[];
  snapshot: ChainSnapshot;
};

export type ProviderResult = {
  proposal: AllocationProposal;
  provider: "deepseek" | "modal" | "ollama" | "fixture";
  modelId: string;
  temperature: number;
  reasoningMode: "enabled" | "disabled";
};

export interface AllocationProvider {
  propose(context: ProviderContext): Promise<ProviderResult>;
}

export interface DocumentSource {
  readonly id: string;
  fetch(): Promise<SourceDocument>;
}

export interface ChainGateway {
  snapshot(): Promise<ChainSnapshot>;
  simulateRebalance(weights: AllocationWeights, reasoningHash: Hex, reasoningCid: string): Promise<void>;
  submitRebalance(weights: AllocationWeights, reasoningHash: Hex, reasoningCid: string): Promise<{ txHash: Hex; epoch: number }>;
}

export interface ReasoningStore {
  pin(canonicalJson: string): Promise<{ cid: string; gatewayUrl: string }>;
  get(cid: string): Promise<string>;
}

export type EpochDiagnostic = {
  requestedAt: string;
  completedAt: string;
  status: "submitted" | "skipped" | "failed";
  provider: string;
  modelId?: string;
  proposalJson?: string;
  envelopeJson?: string;
  reasoningHash?: string;
  reasoningCid?: string;
  txHash?: string;
  error?: string;
};

export interface DiagnosticsStore {
  record(diagnostic: EpochDiagnostic): Promise<void>;
  close(): Promise<void>;
}

export type EpochSuccess = {
  status: "submitted";
  envelope: ReasoningEnvelope;
  canonicalJson: string;
  reasoningHash: Hex;
  reasoningCid: string;
  gatewayUrl: string;
  txHash: Hex;
  epoch: number;
};

export type EpochResult = EpochSuccess | { status: "skipped"; reason: string };
