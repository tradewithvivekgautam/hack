import { z } from "zod";
export declare const STRATEGY_IDS: readonly ["rwa", "lending", "idle"];
export declare const StrategyIdSchema: z.ZodEnum<{
    idle: "idle";
    lending: "lending";
    rwa: "rwa";
}>;
export type StrategyId = z.infer<typeof StrategyIdSchema>;
export declare const STRATEGY_INDEX: Readonly<Record<StrategyId, number>>;
export declare const STRATEGY_METADATA: {
    readonly rwa: {
        readonly id: "rwa";
        readonly label: "RWA yield";
        readonly shortLabel: "RWA";
        readonly description: "Tokenized T-bill and private-credit yield exposure.";
    };
    readonly lending: {
        readonly id: "lending";
        readonly label: "DeFi lending";
        readonly shortLabel: "Lending";
        readonly description: "Over-collateralized stablecoin lending exposure.";
    };
    readonly idle: {
        readonly id: "idle";
        readonly label: "Idle reserve";
        readonly shortLabel: "Idle";
        readonly description: "Immediate withdrawal liquidity with no modeled yield.";
    };
};
//# sourceMappingURL=strategies.d.ts.map