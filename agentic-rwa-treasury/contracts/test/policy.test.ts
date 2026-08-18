import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

const { viem } = await network.create();

describe("AllocationPolicy", () => {
  it("calculates one-way turnover", async () => {
    const policy = await viem.deployContract("AllocationPolicy", [
      6_000,
      2_000,
      3_600,
    ]);
    assert.equal(
      await policy.read.turnoverBps([
        [4_000, 4_000, 2_000],
        [5_500, 3_000, 1_500],
      ]),
      1_500,
    );
  });

  it("accepts a bounded allocation", async () => {
    const policy = await viem.deployContract("AllocationPolicy", [
      6_000,
      2_000,
      3_600,
    ]);
    await policy.read.validate([
      [4_500, 3_500, 2_000],
      [5_500, 3_000, 1_500],
      0n,
    ]);
  });

  it("rejects a strategy above 60%", async () => {
    const policy = await viem.deployContract("AllocationPolicy", [
      6_000,
      2_000,
      3_600,
    ]);
    await assert.rejects(
      policy.read.validate([
        [4_500, 3_500, 2_000],
        [8_000, 1_000, 1_000],
        0n,
      ]),
    );
  });

  it("rejects weights that do not sum to 10,000", async () => {
    const policy = await viem.deployContract("AllocationPolicy", [
      6_000,
      2_000,
      3_600,
    ]);
    await assert.rejects(
      policy.read.validate([
        [4_500, 3_500, 2_000],
        [4_000, 3_000, 2_000],
        0n,
      ]),
    );
  });

  it("rejects turnover above 20%", async () => {
    const policy = await viem.deployContract("AllocationPolicy", [
      6_000,
      2_000,
      3_600,
    ]);
    await assert.rejects(
      policy.read.validate([
        [6_000, 3_000, 1_000],
        [2_000, 3_000, 5_000],
        0n,
      ]),
    );
  });

  it("rejects invalid immutable policy parameters", async () => {
    await assert.rejects(
      viem.deployContract("AllocationPolicy", [3_000, 2_000, 3_600]),
    );
    await assert.rejects(
      viem.deployContract("AllocationPolicy", [6_000, 0, 3_600]),
    );
    await assert.rejects(
      viem.deployContract("AllocationPolicy", [6_000, 2_000, 0]),
    );
  });

  it("rejects a proposal before the cooldown expires", async () => {
    const policy = await viem.deployContract("AllocationPolicy", [
      6_000,
      2_000,
      3_600,
    ]);
    const publicClient = await viem.getPublicClient();
    const block = await publicClient.getBlock();
    await assert.rejects(
      policy.read.validate([
        [4_500, 3_500, 2_000],
        [5_000, 3_000, 2_000],
        block.timestamp,
      ]),
    );
  });
});
