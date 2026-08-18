"use client";

import {
  ReasoningEnvelopeSchema,
  type ReasoningEnvelope,
} from "@agentic-rwa/shared";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { assertLiveConfiguration, webEnv } from "@/config/env";
import { demoDecisions } from "@/lib/demo/decisions";
import { fetchLiveDecisions } from "./decision-queries";

export const decisionsQueryKey = ["decisions"] as const;

export function useDecisions() {
  const client = usePublicClient({ chainId: webEnv.defaultChainId });
  return useQuery({
    queryKey: [...decisionsQueryKey, webEnv.appMode],
    queryFn: async () => {
      if (webEnv.appMode === "demo") return demoDecisions;
      assertLiveConfiguration();
      if (!client) throw new Error("X Layer RPC client is unavailable.");
      return fetchLiveDecisions({
        client,
        registry: webEnv.contracts.registry,
      });
    },
    staleTime:
      webEnv.appMode === "demo" ? Number.POSITIVE_INFINITY : 20_000,
    refetchInterval: webEnv.appMode === "demo" ? false : 30_000,
  });
}

export async function fetchReasoningEnvelope(
  cid: string,
): Promise<ReasoningEnvelope> {
  const response = await fetch(`/api/ipfs/${encodeURIComponent(cid)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      `Reasoning payload request failed with status ${response.status}.`,
    );
  }
  return ReasoningEnvelopeSchema.parse(JSON.parse(await response.text()));
}

export function useDecisionEnvelope(
  cid: string | undefined,
  initial?: ReasoningEnvelope,
) {
  return useQuery({
    queryKey: ["decision-envelope", cid],
    enabled: Boolean(cid) && !initial,
    queryFn: () => fetchReasoningEnvelope(cid as string),
    staleTime: Number.POSITIVE_INFINITY,
    ...(initial ? { initialData: initial } : {}),
  });
}
