"use client";

import { usePathname } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { Suspense } from "react";
import { ContextRailSkeleton } from "@/components/ui/page-skeletons";
import { DecisionContextRail } from "@/features/decisions/components/decision-context-rail";
import { useDecisions } from "@/features/decisions/queries/use-decisions";
import { ProtocolContextRail } from "@/features/protocol/components/protocol-context-rail";
import { SourceContextRail } from "@/features/sources/components/source-context-rail";
import { useSources } from "@/features/sources/queries/use-sources";
import { VaultContextRail } from "@/features/vault/components/vault-context-rail";
import { useVaultSnapshot } from "@/features/vault/queries/use-vault-snapshot";

function RailLoading() {
  return <ContextRailSkeleton />;
}

function DecisionsRail() {
  const query = useDecisions();
  const [epoch, setEpoch] = useQueryState("epoch", parseAsInteger);
  if (!query.data) return <RailLoading />;
  return <DecisionContextRail decisions={query.data} onSelect={(value) => void setEpoch(value, { history: "replace" })} selectedEpoch={epoch ?? query.data[0]?.epoch ?? 0} />;
}

function SourcesRail() {
  const query = useSources();
  return query.data ? <SourceContextRail sources={query.data} /> : <RailLoading />;
}

function VaultRail() {
  const query = useVaultSnapshot();
  return query.data ? <VaultContextRail snapshot={query.data} /> : <RailLoading />;
}

export function ContextRail() {
  const pathname = usePathname();
  return <Suspense fallback={<RailLoading />}>{pathname.startsWith("/decisions") ? <DecisionsRail /> : pathname.startsWith("/sources") ? <SourcesRail /> : pathname.startsWith("/protocol") ? <ProtocolContextRail /> : <VaultRail />}</Suspense>;
}
