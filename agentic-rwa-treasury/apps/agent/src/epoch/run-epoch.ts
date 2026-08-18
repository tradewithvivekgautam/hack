import {
  ReasoningEnvelopeSchema,
  allocationToTuple,
  canonicalReasoningJson,
  hashUtf8Text,
  type ReasoningEnvelope,
} from "@agentic-rwa/shared";
import type { Logger } from "../config/logger.js";
import type {
  AllocationProvider,
  ChainGateway,
  ProviderContext,
  ProviderResult,
  DiagnosticsStore,
  DocumentSource,
  EpochDiagnostic,
  EpochResult,
  ReasoningStore,
} from "../domain/ports.js";
import { PROMPT_HASH, PROMPT_VERSION } from "../providers/prompt.js";
import { gatherDocuments } from "../sources/gather.js";
import { marketWithLiquidityObservation } from "../sources/liquidity-observation.js";
import { asError } from "../sources/source-utils.js";
import { validateProposal } from "./validate-proposal.js";

export type EpochDependencies = {
  provider: AllocationProvider;
  chain: ChainGateway;
  reasoningStore: ReasoningStore;
  diagnostics: DiagnosticsStore;
  sources: readonly DocumentSource[];
  logger: Logger;
};

async function recordDiagnosticsSafely(
  dependencies: EpochDependencies,
  diagnostic: EpochDiagnostic,
): Promise<void> {
  try {
    await dependencies.diagnostics.record(diagnostic);
  } catch (error) {
    // Diagnostics are non-authoritative. A SQLite or filesystem failure must
    // never alter an already-submitted on-chain decision or crash the worker.
    dependencies.logger.warn("diagnostics.write_failed", {
      error: asError(error).message,
      status: diagnostic.status,
    });
  }
}

async function proposeWithSingleRetry(
  provider: AllocationProvider,
  context: ProviderContext,
  logger: Logger,
): Promise<ProviderResult> {
  try {
    return await provider.propose(context);
  } catch (error) {
    logger.warn("provider.retry", {
      attempt: 2,
      reason: asError(error).message,
    });
    return provider.propose(context);
  }
}

async function verifyPinnedPayload(
  store: ReasoningStore,
  cid: string,
  expectedCanonicalJson: string,
  expectedHash: `0x${string}`,
): Promise<void> {
  const persisted = await store.get(cid);
  if (persisted !== expectedCanonicalJson) {
    throw new Error(
      "Pinned reasoning integrity check failed: retrieved bytes differ from the canonical payload.",
    );
  }
  if (hashUtf8Text(persisted).toLowerCase() !== expectedHash.toLowerCase()) {
    throw new Error(
      "Pinned reasoning integrity check failed: retrieved bytes do not match the committed hash.",
    );
  }
}

export async function runEpoch(
  dependencies: EpochDependencies,
): Promise<EpochResult> {
  const requestedAt = new Date().toISOString();
  let providerName = "unknown";

  try {
    dependencies.logger.info("epoch.started", { requestedAt });
    const snapshot = await dependencies.chain.snapshot();
    const documents = await gatherDocuments(dependencies.sources, snapshot);
    const enrichedSnapshot = {
      ...snapshot,
      market: marketWithLiquidityObservation(snapshot.market, documents),
    };

    const providerResult = await proposeWithSingleRetry(
      dependencies.provider,
      {
        documents,
        snapshot: enrichedSnapshot,
      },
      dependencies.logger,
    );
    providerName = providerResult.provider;

    const { weights } = validateProposal({
      proposal: providerResult.proposal,
      snapshot: enrichedSnapshot,
      documents,
    });

    const envelope: ReasoningEnvelope = ReasoningEnvelopeSchema.parse({
      schemaVersion: "1.0.0",
      epochRequestedAt: requestedAt,
      chain: {
        chainId: enrichedSnapshot.chainId,
        vault: enrichedSnapshot.vault,
      },
      model: {
        provider: providerResult.provider,
        modelId: providerResult.modelId,
        temperature: providerResult.temperature,
        reasoningMode: providerResult.reasoningMode,
      },
      prompt: { version: PROMPT_VERSION, hash: PROMPT_HASH },
      policy: enrichedSnapshot.policy,
      currentWeights: enrichedSnapshot.currentWeights,
      market: enrichedSnapshot.market,
      proposal: providerResult.proposal,
      sources: documents.map(({ text: _text, ...metadata }) => metadata),
    });

    const canonicalJson = canonicalReasoningJson(envelope);
    const reasoningHash = hashUtf8Text(canonicalJson);

    // Run the policy and role path on the live chain before creating an IPFS
    // object. The placeholder is deterministic and non-empty; a second exact
    // simulation below uses the real CID before submission.
    const preflightCid = `preflight-${reasoningHash.slice(2)}`;
    await dependencies.chain.simulateRebalance(
      weights,
      reasoningHash,
      preflightCid,
    );

    const pinned = await dependencies.reasoningStore.pin(canonicalJson);

    // Read the payload back before committing it. A gateway or pinning bug must
    // fail closed rather than recording a hash for unavailable bytes.
    await verifyPinnedPayload(
      dependencies.reasoningStore,
      pinned.cid,
      canonicalJson,
      reasoningHash,
    );

    // Simulate the exact transaction arguments after the real CID is known.
    await dependencies.chain.simulateRebalance(
      weights,
      reasoningHash,
      pinned.cid,
    );
    const submitted = await dependencies.chain.submitRebalance(
      weights,
      reasoningHash,
      pinned.cid,
    );

    await recordDiagnosticsSafely(dependencies, {
      requestedAt,
      completedAt: new Date().toISOString(),
      status: "submitted",
      provider: providerResult.provider,
      modelId: providerResult.modelId,
      proposalJson: JSON.stringify(providerResult.proposal),
      envelopeJson: canonicalJson,
      reasoningHash,
      reasoningCid: pinned.cid,
      txHash: submitted.txHash,
    });

    dependencies.logger.info("epoch.submitted", {
      epoch: submitted.epoch,
      txHash: submitted.txHash,
      cid: pinned.cid,
      weights: allocationToTuple(weights),
    });

    return {
      status: "submitted",
      envelope,
      canonicalJson,
      reasoningHash,
      reasoningCid: pinned.cid,
      gatewayUrl: pinned.gatewayUrl,
      txHash: submitted.txHash,
      epoch: submitted.epoch,
    };
  } catch (error) {
    const reason = asError(error).message;
    dependencies.logger.warn("epoch.skipped", { reason });
    await recordDiagnosticsSafely(dependencies, {
      requestedAt,
      completedAt: new Date().toISOString(),
      status: "skipped",
      provider: providerName,
      error: reason,
    });
    return { status: "skipped", reason };
  }
}
