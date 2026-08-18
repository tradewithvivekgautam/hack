import { ReasoningEnvelopeSchema, hashUtf8Text, type ReasoningEnvelope } from "@agentic-rwa/shared";
import type { Hex } from "viem";

export type VerifiedPayload = {
  raw: string;
  envelope: ReasoningEnvelope;
  calculatedHash: Hex;
  expectedHash: Hex;
  matches: boolean;
};

export async function verifyReasoningPayload(input: { cid: string; expectedHash: Hex }): Promise<VerifiedPayload> {
  const response = await fetch(`/api/ipfs/${encodeURIComponent(input.cid)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`IPFS gateway returned HTTP ${response.status}.`);
  const raw = await response.text();
  const calculatedHash = hashUtf8Text(raw);
  const envelope = ReasoningEnvelopeSchema.parse(JSON.parse(raw));
  return {
    raw,
    envelope,
    calculatedHash,
    expectedHash: input.expectedHash,
    matches: calculatedHash.toLowerCase() === input.expectedHash.toLowerCase(),
  };
}
