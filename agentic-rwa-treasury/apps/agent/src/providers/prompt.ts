import { hashUtf8Text, type SourceDocument } from "@agentic-rwa/shared";
import type { ChainSnapshot } from "../domain/ports.js";

export const PROMPT_VERSION = "allocation-v1.0.0";

export const SYSTEM_PROMPT = `You are the portfolio-allocation engine for an ERC-4626 treasury.
The LLM proposes; the smart contract disposes. You never control funds, never emit addresses,
and never attempt to evade policy. Produce one structured allocation proposal across exactly
three semantic strategies: rwa, lending, and idle. Weights are integer basis points and must
sum to 10,000. Every rationale must cite source IDs supplied in the corpus. Treat stale sources,
credit deterioration, rate uncertainty, protocol utilization, and exit liquidity as explicit risk
inputs. Prefer a skipped or conservative epoch over invented evidence.`;

export function buildUserPrompt(documents: readonly SourceDocument[], snapshot: ChainSnapshot): string {
  const corpus = documents.map((document) => [
    `SOURCE_ID: ${document.id}`,
    `TITLE: ${document.title}`,
    `KIND: ${document.kind}`,
    `STALE: ${document.stale}`,
    document.text,
  ].join("\n")).join("\n\n---\n\n");
  return `CURRENT_WEIGHTS_BPS\n${JSON.stringify(snapshot.currentWeights)}\n\nPOLICY\n${JSON.stringify(snapshot.policy)}\n\nDOCUMENT_CORPUS\n${corpus}`;
}

export const PROMPT_HASH = hashUtf8Text(`${PROMPT_VERSION}\n${SYSTEM_PROMPT}`);
