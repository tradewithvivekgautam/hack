import type { AllocationWeights } from "@agentic-rwa/shared";

export const demoCurrentWeights: AllocationWeights = { rwa: 5_500, lending: 3_000, idle: 1_500 };
export const demoTargetWeights: AllocationWeights = { rwa: 5_500, lending: 3_000, idle: 1_500 };

export const demoInitialState = {
  totalAssets: 4_859_700n * 10n ** 6n,
  totalSupply: 4_610_000n * 10n ** 6n,
  userAssetBalance: 24_850n * 10n ** 6n,
  userShareBalance: 18_420n * 10n ** 6n,
  lastRebalanceAt: Math.floor((Date.now() - 28 * 60 * 1000) / 1_000),
} as const;
