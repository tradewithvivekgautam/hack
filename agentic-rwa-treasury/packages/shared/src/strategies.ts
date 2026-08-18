import { z } from "zod";

export const STRATEGY_IDS = ["rwa", "lending", "idle"] as const;
export const StrategyIdSchema = z.enum(STRATEGY_IDS);
export type StrategyId = z.infer<typeof StrategyIdSchema>;

export const STRATEGY_INDEX: Readonly<Record<StrategyId, number>> = {
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
} as const satisfies Record<StrategyId, {
  id: StrategyId;
  label: string;
  shortLabel: string;
  description: string;
}>;
