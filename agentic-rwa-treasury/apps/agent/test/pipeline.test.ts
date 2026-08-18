import { describe, expect, it } from "vitest";
import { FixtureChainGateway } from "../src/chain/fixture-gateway.js";
import { createLogger } from "../src/config/logger.js";
import type {
  DiagnosticsStore,
  EpochDiagnostic,
  ReasoningStore,
} from "../src/domain/ports.js";
import { runEpoch } from "../src/epoch/run-epoch.js";
import { LocalReasoningStore } from "../src/ipfs/local-store.js";
import { FixtureAllocationProvider } from "../src/providers/fixture.js";
import { NullDiagnosticsStore } from "../src/storage/null-diagnostics.js";
import { fixtureSources } from "./helpers.js";

class MaliciousProvider extends FixtureAllocationProvider {
  override async propose(
    context: Parameters<FixtureAllocationProvider["propose"]>[0],
  ) {
    const result = await super.propose(context);
    result.proposal.allocations.rwa.weightBps = 8_000;
    result.proposal.allocations.lending.weightBps = 1_000;
    result.proposal.allocations.idle.weightBps = 1_000;
    return result;
  }
}

class FlakyProvider extends FixtureAllocationProvider {
  attempts = 0;

  override async propose(
    context: Parameters<FixtureAllocationProvider["propose"]>[0],
  ) {
    this.attempts += 1;
    if (this.attempts === 1) {
      throw new Error("temporary inference timeout");
    }
    return super.propose(context);
  }
}

class FailingDiagnosticsStore implements DiagnosticsStore {
  async record(_diagnostic: EpochDiagnostic): Promise<void> {
    throw new Error("diagnostics volume is read-only");
  }

  async close(): Promise<void> {}
}

class CorruptingReasoningStore implements ReasoningStore {
  async pin() {
    return { cid: "corrupted-cid", gatewayUrl: "local://corrupted-cid" };
  }

  async get() {
    return '{"tampered":true}';
  }
}

class CountingReasoningStore implements ReasoningStore {
  pins = 0;

  async pin(): Promise<never> {
    this.pins += 1;
    throw new Error("Pinning must not run after a failed preflight.");
  }

  async get(): Promise<never> {
    throw new Error("No object was pinned.");
  }
}

class RejectingSimulationGateway extends FixtureChainGateway {
  override async simulateRebalance(
    ..._arguments: Parameters<FixtureChainGateway["simulateRebalance"]>
  ): Promise<void> {
    throw new Error("chain preflight rejected the proposal");
  }
}

function dependencies(
  fixture: Awaited<ReturnType<typeof fixtureSources>>,
  overrides: Partial<Parameters<typeof runEpoch>[0]> = {},
): Parameters<typeof runEpoch>[0] {
  return {
    provider: new FixtureAllocationProvider(),
    chain: new FixtureChainGateway(),
    reasoningStore: new LocalReasoningStore(fixture.directory),
    diagnostics: new NullDiagnosticsStore(),
    sources: fixture.sources,
    logger: createLogger("error"),
    ...overrides,
  };
}

describe("epoch pipeline", () => {
  it("completes gather → reason → validate → preflight → pin → verify → exact simulation → submit", async () => {
    const fixture = await fixtureSources();
    const result = await runEpoch(dependencies(fixture));

    expect(result.status).toBe("submitted");
    if (result.status === "submitted") {
      expect(result.reasoningHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(result.epoch).toBe(72);
    }
  });

  it("retries one transient provider failure and then submits", async () => {
    const fixture = await fixtureSources();
    const provider = new FlakyProvider();
    const result = await runEpoch(dependencies(fixture, { provider }));

    expect(provider.attempts).toBe(2);
    expect(result.status).toBe("submitted");
  });

  it("keeps an on-chain success successful when optional diagnostics fail", async () => {
    const fixture = await fixtureSources();
    const result = await runEpoch(
      dependencies(fixture, {
        diagnostics: new FailingDiagnosticsStore(),
      }),
    );

    expect(result.status).toBe("submitted");
  });

  it("fails closed before chain submission for a malicious model proposal", async () => {
    const fixture = await fixtureSources();
    const result = await runEpoch(
      dependencies(fixture, { provider: new MaliciousProvider() }),
    );

    expect(result.status).toBe("skipped");
    if (result.status === "skipped") expect(result.reason).toContain("cap");
  });


  it("does not pin a memo when live-chain preflight rejects it", async () => {
    const fixture = await fixtureSources();
    const reasoningStore = new CountingReasoningStore();
    const result = await runEpoch(
      dependencies(fixture, {
        chain: new RejectingSimulationGateway(),
        reasoningStore,
      }),
    );

    expect(result.status).toBe("skipped");
    expect(reasoningStore.pins).toBe(0);
    if (result.status === "skipped") {
      expect(result.reason).toContain("preflight rejected");
    }
  });

  it("fails closed when pinned bytes differ from the canonical memo", async () => {
    const fixture = await fixtureSources();
    const result = await runEpoch(
      dependencies(fixture, {
        reasoningStore: new CorruptingReasoningStore(),
      }),
    );

    expect(result.status).toBe("skipped");
    if (result.status === "skipped") {
      expect(result.reason).toContain("integrity check failed");
    }
  });
});
