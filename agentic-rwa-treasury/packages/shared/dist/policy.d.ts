import { z } from "zod";
import { type StrategyId } from "./strategies.js";
export declare const BASIS_POINTS: 10000;
export declare const AllocationWeightsSchema: z.ZodObject<{
    rwa: z.ZodNumber;
    lending: z.ZodNumber;
    idle: z.ZodNumber;
}, z.core.$strict>;
export type AllocationWeights = z.infer<typeof AllocationWeightsSchema>;
export declare const PolicySnapshotSchema: z.ZodObject<{
    maxWeightBps: z.ZodNumber;
    maxTurnoverBps: z.ZodNumber;
    cooldownSeconds: z.ZodNumber;
}, z.core.$strict>;
export type PolicySnapshot = z.infer<typeof PolicySnapshotSchema>;
export declare const DEFAULT_POLICY: PolicySnapshot;
export type PolicyViolationCode = "INVALID_SUM" | "STRATEGY_CAP" | "TURNOVER_CAP" | "COOLDOWN";
export type PolicyViolation = {
    code: PolicyViolationCode;
    message: string;
    strategyId?: StrategyId;
    actual?: number;
    maximum?: number;
    availableAt?: number;
};
export type PolicyEvaluation = {
    accepted: boolean;
    turnoverBps: number;
    violations: readonly PolicyViolation[];
};
export declare function allocationToTuple(weights: AllocationWeights): readonly [number, number, number];
export declare function tupleToAllocation(weights: readonly [number, number, number]): AllocationWeights;
export declare function allocationSum(weights: AllocationWeights): number;
export declare function calculateTurnoverBps(current: AllocationWeights, proposed: AllocationWeights): number;
export declare function evaluatePolicy(input: {
    current: AllocationWeights;
    proposed: AllocationWeights;
    policy: PolicySnapshot;
    nowUnixSeconds: number;
    lastRebalanceAtUnixSeconds: number;
}): PolicyEvaluation;
export declare function assertPolicyAccepted(evaluation: PolicyEvaluation): void;
export declare function weightsFromAssets(input: {
    rwa: bigint;
    lending: bigint;
    idle: bigint;
    unallocated?: bigint;
}): AllocationWeights;
//# sourceMappingURL=policy.d.ts.map