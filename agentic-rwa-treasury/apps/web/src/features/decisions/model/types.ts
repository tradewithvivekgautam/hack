import type {
  AllocationWeights,
  Confidence,
  ReasoningEnvelope,
} from "@agentic-rwa/shared";
import type { Address, Hex } from "viem";

export type DecisionRecord = {
  epoch: number;
  timestamp: string;
  weights: AllocationWeights;
  reasoningHash: Hex;
  reasoningCid: string;
  transactionHash?: Hex;
  agent: Address;
  totalAssets: bigint;
  confidence: Confidence;
  modelId: string;
  envelope?: ReasoningEnvelope;
  sourceUrl?: string;
};

export type VerificationResult =
  | { status: "idle" }
  | { status: "verifying"; expectedHash: Hex }
  | {
      status: "verified" | "mismatch";
      expectedHash: Hex;
      calculatedHash: Hex;
      message: string;
    }
  | { status: "error"; expectedHash: Hex; message: string };
