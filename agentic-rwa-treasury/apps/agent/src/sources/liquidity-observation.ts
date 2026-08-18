import {
  MarketSnapshotSchema,
  type MarketSnapshot,
  type SourceDocument,
} from "@agentic-rwa/shared";

function readNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function marketWithLiquidityObservation(
  market: MarketSnapshot,
  documents: readonly SourceDocument[],
): MarketSnapshot {
  const candidates = documents
    .filter((document) => document.kind === "liquidity")
    .sort((left, right) => Date.parse(right.fetchedAt) - Date.parse(left.fetchedAt));

  for (const document of candidates) {
    try {
      const parsed = JSON.parse(document.text) as Record<string, unknown>;
      const notionalUsd = readNumber(parsed["notionalUsd"]);
      const estimatedPriceImpactBps = readNumber(
        parsed["estimatedPriceImpactBps"],
      );
      const routeAvailable =
        parsed["routeAvailable"] === true || parsed["available"] === true;
      const observedAt =
        typeof parsed["observedAt"] === "string"
          ? parsed["observedAt"]
          : document.fetchedAt;

      if (notionalUsd === null || estimatedPriceImpactBps === null) {
        continue;
      }

      return MarketSnapshotSchema.parse({
        ...market,
        okxExitLiquidity: {
          available: routeAvailable,
          notionalUsd,
          estimatedPriceImpactBps,
          observedAt,
        },
      });
    } catch {
      // Unstructured liquidity documents remain available to the model even
      // when they cannot populate the normalized market snapshot.
    }
  }

  return market;
}
