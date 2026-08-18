import { AllocationProposalSchema } from "@agentic-rwa/shared";
import type { AllocationProvider, ProviderContext, ProviderResult } from "../domain/ports.js";

export class FixtureAllocationProvider implements AllocationProvider {
  async propose(context: ProviderContext): Promise<ProviderResult> {
    const ids = new Set(context.documents.map((document) => document.id));
    const evidence = (preferred: readonly string[], claim: string) => ({
      sourceId:
        preferred.find((sourceId) => ids.has(sourceId)) ??
        context.documents[0]!.id,
      claim,
    });
    const proposal = AllocationProposalSchema.parse({
      allocations: {
        rwa: {
          weightBps: 5_500,
          rationale: "Stable duration income and the observed spread support a measured RWA overweight without reaching the contract cap.",
          evidence: [evidence(["rwa-fund-factsheet"], "The supplied fund material reports stable NAV and durable income.")],
        },
        lending: {
          weightBps: 3_000,
          rationale: "Lending retains diversified on-chain income while reducing exposure to variable utilization and smart-contract risk.",
          evidence: [evidence(["live-chain-state"], "The current adapter state shows positive lending yield and bounded allocation.")],
        },
        idle: {
          weightBps: 1_500,
          rationale: "A fifteen-percent reserve preserves immediate redemption capacity and absorbs uncertainty in exit liquidity.",
          evidence: [evidence(["okx-rwa-exit-liquidity", "okx-rwa-exit-liquidity-fixture"], "The latest liquidity observation is treated as a direct exit-risk input.")],
        },
      },
      thesis: "The portfolio can add measured RWA exposure because reported income remains attractive relative to idle cash, while retaining diversified lending yield and enough immediate liquidity for normal redemptions.",
      risks: [
        "Credit spreads may widen before the next scheduled epoch.",
        "RWA exit liquidity can deteriorate faster than published NAV changes.",
        "DeFi lending utilization and smart-contract conditions can change intraday.",
      ],
      confidence: "medium",
    });
    return { proposal, provider: "fixture", modelId: "fixture-allocation-v1", temperature: 0, reasoningMode: "enabled" };
  }
}
