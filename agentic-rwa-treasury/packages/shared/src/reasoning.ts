import { canonicalize } from "json-canonicalize";
import { keccak256, stringToBytes, type Hex } from "viem";
import { z } from "zod";
import { AllocationWeightsSchema, PolicySnapshotSchema } from "./policy.js";
import { STRATEGY_IDS, type StrategyId } from "./strategies.js";

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const EvidenceReferenceSchema = z
  .object({ sourceId: z.string().min(1).max(128), claim: z.string().min(1).max(600) })
  .strict();

export const StrategyRationaleSchema = z
  .object({
    weightBps: z.number().int().min(0).max(10_000),
    rationale: z.string().min(12).max(2_000),
    evidence: z.array(EvidenceReferenceSchema).min(1).max(6),
  })
  .strict();

export const AllocationProposalSchema = z
  .object({
    allocations: z
      .object({
        rwa: StrategyRationaleSchema,
        lending: StrategyRationaleSchema,
        idle: StrategyRationaleSchema,
      })
      .strict(),
    thesis: z.string().min(40).max(4_000),
    risks: z.array(z.string().min(8).max(600)).min(1).max(4),
    confidence: ConfidenceSchema,
  })
  .strict()
  .superRefine((proposal, context) => {
    const parsed = AllocationWeightsSchema.safeParse({
      rwa: proposal.allocations.rwa.weightBps,
      lending: proposal.allocations.lending.weightBps,
      idle: proposal.allocations.idle.weightBps,
    });
    if (!parsed.success) {
      context.addIssue({
        code: "custom",
        message: parsed.error.issues.map((issue) => issue.message).join(" "),
        path: ["allocations"],
      });
    }
  });

export type AllocationProposal = z.infer<typeof AllocationProposalSchema>;

export const SourceDocumentSchema = z
  .object({
    id: z.string().min(1).max(128),
    kind: z.enum([
      "fund-factsheet",
      "credit-memo",
      "rate-announcement",
      "liquidity",
      "chain-state",
      "decision-history",
      "other",
    ]),
    title: z.string().min(1).max(240),
    sourceUrl: z.string().min(1).max(2_000),
    publishedAt: z.string().datetime(),
    fetchedAt: z.string().datetime(),
    text: z.string().min(1),
    contentHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    stale: z.boolean(),
    staleReason: z.string().max(500).optional(),
  })
  .strict();

export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

export const AdapterStateSchema = z.object({
  strategyId: z.enum(STRATEGY_IDS),
  assets: z.string().regex(/^\d+$/),
  apyBps: z.number().int().min(0).max(100_000),
}).strict();

export const MarketSnapshotSchema = z.object({
  totalAssets: z.string().regex(/^\d+$/),
  adapters: z.array(AdapterStateSchema).length(3),
  okxExitLiquidity: z.object({
    available: z.boolean(),
    notionalUsd: z.number().nonnegative(),
    estimatedPriceImpactBps: z.number().nonnegative(),
    observedAt: z.string().datetime(),
  }).strict(),
}).strict();

export type MarketSnapshot = z.infer<typeof MarketSnapshotSchema>;

export const ReasoningEnvelopeSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    epochRequestedAt: z.string().datetime(),
    chain: z.object({ chainId: z.number().int().positive(), vault: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }).strict(),
    model: z.object({
      provider: z.enum(["deepseek", "modal", "ollama", "fixture"]),
      modelId: z.string().min(1).max(128),
      temperature: z.number().min(0).max(2),
      reasoningMode: z.enum(["enabled", "disabled"]),
    }).strict(),
    prompt: z.object({
      version: z.string().min(1).max(64),
      hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    }).strict(),
    policy: PolicySnapshotSchema,
    currentWeights: AllocationWeightsSchema,
    market: MarketSnapshotSchema,
    proposal: AllocationProposalSchema,
    sources: z.array(SourceDocumentSchema.omit({ text: true })).min(1),
  })
  .strict();

export type ReasoningEnvelope = z.infer<typeof ReasoningEnvelopeSchema>;

export function proposalWeights(proposal: AllocationProposal) {
  return AllocationWeightsSchema.parse({
    rwa: proposal.allocations.rwa.weightBps,
    lending: proposal.allocations.lending.weightBps,
    idle: proposal.allocations.idle.weightBps,
  });
}

export function canonicalReasoningJson(envelope: ReasoningEnvelope): string {
  return canonicalize(ReasoningEnvelopeSchema.parse(envelope));
}

export function hashUtf8Text(text: string): Hex {
  return keccak256(stringToBytes(text));
}

export function hashReasoningEnvelope(envelope: ReasoningEnvelope): Hex {
  return hashUtf8Text(canonicalReasoningJson(envelope));
}

export function assertEvidenceReferencesExist(
  proposal: AllocationProposal,
  sourceIds: ReadonlySet<string>,
): void {
  for (const strategyId of STRATEGY_IDS) {
    for (const evidence of proposal.allocations[strategyId].evidence) {
      if (!sourceIds.has(evidence.sourceId)) {
        throw new Error(`${strategyId} references unknown source ${evidence.sourceId}.`);
      }
    }
  }
}

export function strategyRationale(proposal: AllocationProposal, strategyId: StrategyId) {
  return proposal.allocations[strategyId];
}
