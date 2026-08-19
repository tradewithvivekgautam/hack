import { type Hex } from "viem";
import { z } from "zod";
import { type StrategyId } from "./strategies.js";
export declare const ConfidenceSchema: z.ZodEnum<{
    high: "high";
    low: "low";
    medium: "medium";
}>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export declare const EvidenceReferenceSchema: z.ZodObject<{
    sourceId: z.ZodString;
    claim: z.ZodString;
}, z.core.$strict>;
export declare const StrategyRationaleSchema: z.ZodObject<{
    weightBps: z.ZodNumber;
    rationale: z.ZodString;
    evidence: z.ZodArray<z.ZodObject<{
        sourceId: z.ZodString;
        claim: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const AllocationProposalSchema: z.ZodObject<{
    allocations: z.ZodObject<{
        rwa: z.ZodObject<{
            weightBps: z.ZodNumber;
            rationale: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                sourceId: z.ZodString;
                claim: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        lending: z.ZodObject<{
            weightBps: z.ZodNumber;
            rationale: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                sourceId: z.ZodString;
                claim: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        idle: z.ZodObject<{
            weightBps: z.ZodNumber;
            rationale: z.ZodString;
            evidence: z.ZodArray<z.ZodObject<{
                sourceId: z.ZodString;
                claim: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    thesis: z.ZodString;
    risks: z.ZodArray<z.ZodString>;
    confidence: z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>;
}, z.core.$strict>;
export type AllocationProposal = z.infer<typeof AllocationProposalSchema>;
export declare const SourceDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
        "chain-state": "chain-state";
        "credit-memo": "credit-memo";
        "decision-history": "decision-history";
        "fund-factsheet": "fund-factsheet";
        liquidity: "liquidity";
        other: "other";
        "rate-announcement": "rate-announcement";
    }>;
    title: z.ZodString;
    sourceUrl: z.ZodString;
    publishedAt: z.ZodString;
    fetchedAt: z.ZodString;
    text: z.ZodString;
    contentHash: z.ZodString;
    stale: z.ZodBoolean;
    staleReason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;
export declare const AdapterStateSchema: z.ZodObject<{
    strategyId: z.ZodEnum<{
        idle: "idle";
        lending: "lending";
        rwa: "rwa";
    }>;
    assets: z.ZodString;
    apyBps: z.ZodNumber;
}, z.core.$strict>;
export declare const MarketSnapshotSchema: z.ZodObject<{
    totalAssets: z.ZodString;
    adapters: z.ZodArray<z.ZodObject<{
        strategyId: z.ZodEnum<{
            idle: "idle";
            lending: "lending";
            rwa: "rwa";
        }>;
        assets: z.ZodString;
        apyBps: z.ZodNumber;
    }, z.core.$strict>>;
    okxExitLiquidity: z.ZodObject<{
        available: z.ZodBoolean;
        notionalUsd: z.ZodNumber;
        estimatedPriceImpactBps: z.ZodNumber;
        observedAt: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MarketSnapshot = z.infer<typeof MarketSnapshotSchema>;
export declare const ReasoningEnvelopeSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1.0.0">;
    epochRequestedAt: z.ZodString;
    chain: z.ZodObject<{
        chainId: z.ZodNumber;
        vault: z.ZodString;
    }, z.core.$strict>;
    model: z.ZodObject<{
        provider: z.ZodEnum<{
            deepseek: "deepseek";
            fixture: "fixture";
            modal: "modal";
            ollama: "ollama";
        }>;
        modelId: z.ZodString;
        temperature: z.ZodNumber;
        reasoningMode: z.ZodEnum<{
            disabled: "disabled";
            enabled: "enabled";
        }>;
    }, z.core.$strict>;
    prompt: z.ZodObject<{
        version: z.ZodString;
        hash: z.ZodString;
    }, z.core.$strict>;
    policy: z.ZodObject<{
        maxWeightBps: z.ZodNumber;
        maxTurnoverBps: z.ZodNumber;
        cooldownSeconds: z.ZodNumber;
    }, z.core.$strict>;
    currentWeights: z.ZodObject<{
        rwa: z.ZodNumber;
        lending: z.ZodNumber;
        idle: z.ZodNumber;
    }, z.core.$strict>;
    market: z.ZodObject<{
        totalAssets: z.ZodString;
        adapters: z.ZodArray<z.ZodObject<{
            strategyId: z.ZodEnum<{
                idle: "idle";
                lending: "lending";
                rwa: "rwa";
            }>;
            assets: z.ZodString;
            apyBps: z.ZodNumber;
        }, z.core.$strict>>;
        okxExitLiquidity: z.ZodObject<{
            available: z.ZodBoolean;
            notionalUsd: z.ZodNumber;
            estimatedPriceImpactBps: z.ZodNumber;
            observedAt: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>;
    proposal: z.ZodObject<{
        allocations: z.ZodObject<{
            rwa: z.ZodObject<{
                weightBps: z.ZodNumber;
                rationale: z.ZodString;
                evidence: z.ZodArray<z.ZodObject<{
                    sourceId: z.ZodString;
                    claim: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            lending: z.ZodObject<{
                weightBps: z.ZodNumber;
                rationale: z.ZodString;
                evidence: z.ZodArray<z.ZodObject<{
                    sourceId: z.ZodString;
                    claim: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            idle: z.ZodObject<{
                weightBps: z.ZodNumber;
                rationale: z.ZodString;
                evidence: z.ZodArray<z.ZodObject<{
                    sourceId: z.ZodString;
                    claim: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        thesis: z.ZodString;
        risks: z.ZodArray<z.ZodString>;
        confidence: z.ZodEnum<{
            high: "high";
            low: "low";
            medium: "medium";
        }>;
    }, z.core.$strict>;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<{
            "chain-state": "chain-state";
            "credit-memo": "credit-memo";
            "decision-history": "decision-history";
            "fund-factsheet": "fund-factsheet";
            liquidity: "liquidity";
            other: "other";
            "rate-announcement": "rate-announcement";
        }>;
        title: z.ZodString;
        sourceUrl: z.ZodString;
        publishedAt: z.ZodString;
        fetchedAt: z.ZodString;
        contentHash: z.ZodString;
        stale: z.ZodBoolean;
        staleReason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ReasoningEnvelope = z.infer<typeof ReasoningEnvelopeSchema>;
export declare function proposalWeights(proposal: AllocationProposal): {
    rwa: number;
    lending: number;
    idle: number;
};
export declare function canonicalReasoningJson(envelope: ReasoningEnvelope): string;
export declare function hashUtf8Text(text: string): Hex;
export declare function hashReasoningEnvelope(envelope: ReasoningEnvelope): Hex;
export declare function assertEvidenceReferencesExist(proposal: AllocationProposal, sourceIds: ReadonlySet<string>): void;
export declare function strategyRationale(proposal: AllocationProposal, strategyId: StrategyId): {
    weightBps: number;
    rationale: string;
    evidence: {
        sourceId: string;
        claim: string;
    }[];
};
//# sourceMappingURL=reasoning.d.ts.map