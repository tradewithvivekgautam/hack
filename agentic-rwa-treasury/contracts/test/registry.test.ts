import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keccak256, stringToHex, zeroHash } from "viem";
import { deployProtocol } from "./fixture.js";

describe("ReasoningRegistry", () => {
  it("allows only a writer to append decisions", async () => {
    const { registry, stranger } = await deployProtocol();
    await assert.rejects(
      stranger.writeContract({
        address: registry.address,
        abi: registry.abi,
        functionName: "recordDecision",
        args: [
          [4_500, 3_500, 2_000],
          keccak256(stringToHex("memo")),
          "bafy-memo",
          stranger.account.address,
          0n,
        ],
      }),
    );
  });

  it("rejects an empty hash, empty CID and zero agent", async () => {
    const { registry, admin } = await deployProtocol();
    const writerRole = await registry.read.WRITER_ROLE();
    await registry.write.grantRole([writerRole, admin.account.address]);

    await assert.rejects(
      registry.write.recordDecision([
        [4_500, 3_500, 2_000],
        zeroHash,
        "bafy-memo",
        admin.account.address,
        0n,
      ]),
    );
    await assert.rejects(
      registry.write.recordDecision([
        [4_500, 3_500, 2_000],
        keccak256(stringToHex("memo")),
        "",
        admin.account.address,
        0n,
      ]),
    );
    await assert.rejects(
      registry.write.recordDecision([
        [4_500, 3_500, 2_000],
        keccak256(stringToHex("memo")),
        "bafy-memo",
        "0x0000000000000000000000000000000000000000",
        0n,
      ]),
    );
  });

  it("rejects reads for an epoch that has not been recorded", async () => {
    const { registry } = await deployProtocol();
    await assert.rejects(registry.read.decision([1n]));
  });

  it("stores the exact hash, CID, weights and agent through a vault rebalance", async () => {
    const { vault, registry, agent } = await deployProtocol();
    const hash = keccak256(stringToHex("canonical reasoning"));
    await agent.writeContract({
      address: vault.address,
      abi: vault.abi,
      functionName: "rebalance",
      args: [[5_500, 3_000, 1_500], hash, "bafy-canonical"],
    });
    const decision = await registry.read.decision([1n]);
    assert.equal(decision.reasoningHash, hash);
    assert.equal(decision.reasoningCid, "bafy-canonical");
    assert.deepEqual([...decision.weights], [5_500, 3_000, 1_500]);
    assert.equal(
      decision.agent.toLowerCase(),
      agent.account.address.toLowerCase(),
    );
  });
});
