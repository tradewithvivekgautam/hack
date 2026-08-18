import { hashUtf8Text, type SourceDocument } from "@agentic-rwa/shared";
import type { ChainSnapshot, DocumentSource } from "../domain/ports.js";
import { asError } from "./source-utils.js";

export async function gatherDocuments(
  sources: readonly DocumentSource[],
  snapshot: ChainSnapshot,
): Promise<SourceDocument[]> {
  const results = await Promise.allSettled(
    sources.map((source) => source.fetch()),
  );
  const documents: SourceDocument[] = [];
  const sourceAvailability = results.map((result, index) => {
    const source = sources[index];
    if (!source) throw new Error(`Source result ${index} has no matching source.`);
    if (result.status === "fulfilled") {
      documents.push(result.value);
      return { id: source.id, available: true as const };
    }
    return {
      id: source.id,
      available: false as const,
      error: asError(result.reason).message,
    };
  });

  if (documents.length < 3) {
    throw new Error(
      `Only ${documents.length} source documents were available; at least three are required.`,
    );
  }

  const fetchedAt = new Date().toISOString();
  const availabilityText = JSON.stringify(sourceAvailability, null, 2);
  documents.push({
    id: "source-availability",
    kind: "other",
    title: "Epoch source availability report",
    sourceUrl: "agent://source-availability",
    publishedAt: fetchedAt,
    fetchedAt,
    text: availabilityText,
    contentHash: hashUtf8Text(availabilityText),
    stale: false,
  });

  const chainText = JSON.stringify(
    {
      totalAssets: snapshot.totalAssets.toString(),
      currentWeights: snapshot.currentWeights,
      policy: snapshot.policy,
      market: snapshot.market,
      lastRebalanceAt: snapshot.lastRebalanceAt,
    },
    null,
    2,
  );
  documents.push({
    id: "live-chain-state",
    kind: "chain-state",
    title: "Live vault and adapter state",
    sourceUrl: `chain://${snapshot.chainId}/${snapshot.vault}`,
    publishedAt: fetchedAt,
    fetchedAt,
    text: chainText,
    contentHash: hashUtf8Text(chainText),
    stale: false,
  });

  const historyText = JSON.stringify(
    snapshot.recentDecisions,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );
  const normalizedHistory = historyText || "No previous decisions.";
  documents.push({
    id: "recent-decision-history",
    kind: "decision-history",
    title: "Recent allocation decisions",
    sourceUrl: `chain://${snapshot.chainId}/${snapshot.vault}/decisions`,
    publishedAt: fetchedAt,
    fetchedAt,
    text: normalizedHistory,
    contentHash: hashUtf8Text(normalizedHistory),
    stale: false,
  });

  return documents;
}
