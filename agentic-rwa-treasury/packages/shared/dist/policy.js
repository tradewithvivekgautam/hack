import { z } from "zod";
import { STRATEGY_IDS } from "./strategies.js";
export const BASIS_POINTS = 10_000;
export const AllocationWeightsSchema = z
    .object({
    rwa: z.number().int().min(0).max(BASIS_POINTS),
    lending: z.number().int().min(0).max(BASIS_POINTS),
    idle: z.number().int().min(0).max(BASIS_POINTS),
})
    .strict()
    .superRefine((weights, context) => {
    const sum = weights.rwa + weights.lending + weights.idle;
    if (sum !== BASIS_POINTS) {
        context.addIssue({
            code: "custom",
            message: `Allocation weights must sum to ${BASIS_POINTS} bps; received ${sum}.`,
        });
    }
});
export const PolicySnapshotSchema = z
    .object({
    maxWeightBps: z.number().int().min(1).max(BASIS_POINTS),
    maxTurnoverBps: z.number().int().min(0).max(BASIS_POINTS),
    cooldownSeconds: z.number().int().positive(),
})
    .strict();
export const DEFAULT_POLICY = {
    maxWeightBps: 6_000,
    maxTurnoverBps: 2_000,
    cooldownSeconds: 3_600,
};
export function allocationToTuple(weights) {
    return [weights.rwa, weights.lending, weights.idle];
}
export function tupleToAllocation(weights) {
    return AllocationWeightsSchema.parse({ rwa: weights[0], lending: weights[1], idle: weights[2] });
}
export function allocationSum(weights) {
    return weights.rwa + weights.lending + weights.idle;
}
export function calculateTurnoverBps(current, proposed) {
    const movement = STRATEGY_IDS.reduce((total, strategyId) => total + Math.abs(proposed[strategyId] - current[strategyId]), 0);
    return Math.floor(movement / 2);
}
export function evaluatePolicy(input) {
    const violations = [];
    const sum = allocationSum(input.proposed);
    if (sum !== BASIS_POINTS) {
        violations.push({
            code: "INVALID_SUM",
            message: `Weights sum to ${sum} bps instead of ${BASIS_POINTS} bps.`,
            actual: sum,
            maximum: BASIS_POINTS,
        });
    }
    for (const strategyId of STRATEGY_IDS) {
        const weight = input.proposed[strategyId];
        if (weight > input.policy.maxWeightBps) {
            violations.push({
                code: "STRATEGY_CAP",
                message: `${strategyId} exceeds the ${input.policy.maxWeightBps} bps strategy cap.`,
                strategyId,
                actual: weight,
                maximum: input.policy.maxWeightBps,
            });
        }
    }
    const turnoverBps = calculateTurnoverBps(input.current, input.proposed);
    if (turnoverBps > input.policy.maxTurnoverBps) {
        violations.push({
            code: "TURNOVER_CAP",
            message: `Turnover is ${turnoverBps} bps, above the ${input.policy.maxTurnoverBps} bps limit.`,
            actual: turnoverBps,
            maximum: input.policy.maxTurnoverBps,
        });
    }
    if (input.lastRebalanceAtUnixSeconds > 0) {
        const availableAt = input.lastRebalanceAtUnixSeconds + input.policy.cooldownSeconds;
        if (input.nowUnixSeconds < availableAt) {
            violations.push({
                code: "COOLDOWN",
                message: `The next rebalance is available at Unix time ${availableAt}.`,
                availableAt,
            });
        }
    }
    return { accepted: violations.length === 0, turnoverBps, violations };
}
export function assertPolicyAccepted(evaluation) {
    if (!evaluation.accepted) {
        throw new Error(evaluation.violations.map((violation) => violation.message).join(" "));
    }
}
export function weightsFromAssets(input) {
    const unallocated = input.unallocated ?? 0n;
    const total = input.rwa + input.lending + input.idle + unallocated;
    if (total === 0n)
        return { rwa: 0, lending: 0, idle: BASIS_POINTS };
    const rwa = Number((input.rwa * BigInt(BASIS_POINTS)) / total);
    const lending = Number((input.lending * BigInt(BASIS_POINTS)) / total);
    return AllocationWeightsSchema.parse({ rwa, lending, idle: BASIS_POINTS - rwa - lending });
}
//# sourceMappingURL=policy.js.map