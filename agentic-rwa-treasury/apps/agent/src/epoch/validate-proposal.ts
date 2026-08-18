import {
  assertEvidenceReferencesExist,
  assertPolicyAccepted,
  evaluatePolicy,
  proposalWeights,
  type AllocationProposal,
  type SourceDocument,
} from "@agentic-rwa/shared";
import type { ChainSnapshot } from "../domain/ports.js";

export function validateProposal(input: {
  proposal: AllocationProposal;
  snapshot: ChainSnapshot;
  documents: readonly SourceDocument[];
  nowUnixSeconds?: number;
}) {
  assertEvidenceReferencesExist(
    input.proposal,
    new Set(input.documents.map((item) => item.id)),
  );

  const weights = proposalWeights(input.proposal);
  const evaluation = evaluatePolicy({
    current: input.snapshot.currentWeights,
    proposed: weights,
    policy: input.snapshot.policy,
    nowUnixSeconds:
      input.nowUnixSeconds ?? Math.floor(Date.now() / 1_000),
    lastRebalanceAtUnixSeconds: input.snapshot.lastRebalanceAt,
  });
  assertPolicyAccepted(evaluation);

  return { weights, evaluation };
}
