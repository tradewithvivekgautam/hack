import { registryAbi, tupleToAllocation } from "@agentic-rwa/shared";
import type { Address, Hex, PublicClient } from "viem";
import type { DecisionRecord } from "../model/types";

function field<T>(value: unknown, key: string, index: number): T {
  if (typeof value === "object" && value !== null && key in value) {
    return (value as Record<string, unknown>)[key] as T;
  }
  return (value as readonly unknown[])[index] as T;
}

export async function fetchLiveDecisions(input: {
  client: PublicClient;
  registry: Address;
  limit?: number;
}): Promise<readonly DecisionRecord[]> {
  const latestEpoch = Number(
    await input.client.readContract({
      address: input.registry,
      abi: registryAbi,
      functionName: "epoch",
    }),
  );

  if (latestEpoch === 0) return [];

  const firstEpoch = Math.max(1, latestEpoch - (input.limit ?? 100) + 1);
  const epochs = Array.from(
    { length: latestEpoch - firstEpoch + 1 },
    (_, index) => firstEpoch + index,
  );

  const records = await input.client.multicall({
    allowFailure: false,
    contracts: epochs.map((decisionEpoch) => ({
      address: input.registry,
      abi: registryAbi,
      functionName: "decision" as const,
      args: [BigInt(decisionEpoch)] as const,
    })),
  });

  return records
    .map((value, index) => {
      const decisionEpoch = epochs[index] as number;
      const tuple = field<readonly unknown[]>(value, "weights", 1);
      const timestampSeconds = Number(field<bigint>(value, "timestamp", 0));

      return {
        epoch: decisionEpoch,
        timestamp: new Date(timestampSeconds * 1_000).toISOString(),
        weights: tupleToAllocation([
          Number(tuple[0]),
          Number(tuple[1]),
          Number(tuple[2]),
        ]),
        reasoningHash: field<Hex>(value, "reasoningHash", 2),
        reasoningCid: field<string>(value, "reasoningCid", 3),
        agent: field<Address>(value, "agent", 4),
        totalAssets: field<bigint>(value, "totalAssets", 5),
        confidence: "medium" as const,
        modelId: "Resolved from IPFS",
        sourceUrl: `/api/ipfs/${encodeURIComponent(field<string>(value, "reasoningCid", 3))}`,
      } satisfies DecisionRecord;
    })
    .reverse();
}
