import { z } from "zod";
export const STRATEGY_IDS = ["rwa", "lending", "idle"];
export const StrategyIdSchema = z.enum(STRATEGY_IDS);
export const STRATEGY_INDEX = {
    rwa: 0,
    lending: 1,
    idle: 2,
};
export const STRATEGY_METADATA = {
    rwa: {
        id: "rwa",
        label: "RWA yield",
        shortLabel: "RWA",
        description: "Tokenized T-bill and private-credit yield exposure.",
    },
    lending: {
        id: "lending",
        label: "DeFi lending",
        shortLabel: "Lending",
        description: "Over-collateralized stablecoin lending exposure.",
    },
    idle: {
        id: "idle",
        label: "Idle reserve",
        shortLabel: "Idle",
        description: "Immediate withdrawal liquidity with no modeled yield.",
    },
};
//# sourceMappingURL=strategies.js.map