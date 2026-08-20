"use client";

import { useMemo } from "react";
import { webEnv } from "@/config/env";
import { demoSources } from "@/lib/demo/sources";
import type { SourceStatus } from "../model/types";
import { useDecisionEnvelope, useDecisions } from "@/features/decisions/queries/use-decisions";

export function useSources(): { data: readonly SourceStatus[]; isLoading: boolean; error?: Error } {
  const decisions = useDecisions();
  const latest = decisions.data?.[0];
  const envelope = useDecisionEnvelope(latest?.reasoningCid, latest?.envelope);
  const data = useMemo(() => {
    if (webEnv.appMode === "demo") return demoSources;
    if (!envelope.data || !envelope.data.sources?.length) return demoSources;
    return envelope.data.sources.map((source) => ({
      id: source.id,
      title: source.title,
      kind: source.kind.replaceAll("-", " "),
      publishedAt: source.publishedAt,
      fetchedAt: source.fetchedAt,
      contentHash: source.contentHash,
      stale: source.stale,
      description: source.staleReason ?? "Source metadata committed inside the latest canonical decision envelope.",
      integration: source.kind === "chain-state" ? "chain" : source.kind === "liquidity" ? "live" : "fixture",
    } satisfies SourceStatus));
  }, [envelope.data]);
  const error = decisions.error instanceof Error ? decisions.error : envelope.error instanceof Error ? envelope.error : undefined;
  return { data, isLoading: decisions.isLoading || envelope.isLoading, ...(error ? { error } : {}) };
}
