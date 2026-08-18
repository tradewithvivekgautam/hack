import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keccak256, stringToHex } from "viem";
import { approveAndDeposit, deployProtocol } from "./fixture.js";

const USDC = 10n ** 6n;

describe("RwaTreasuryVault", () => {
  it("routes ERC-4626 deposits to all strategies", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 100_000n * USDC);
    assert.equal(await fixture.vault.read.balanceOf([fixture.depositor.account.address]), 100_000n * USDC);
    assert.equal(await fixture.rwa.read.totalAssets(), 45_000n * USDC);
    assert.equal(await fixture.lending.read.totalAssets(), 35_000n * USDC);
    assert.equal(await fixture.idle.read.totalAssets(), 20_000n * USDC);
  });

  it("retrieves liquidity from adapters and supports withdrawal at any allocation", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 100_000n * USDC);
    await fixture.depositor.writeContract({
      address: fixture.vault.address,
      abi: fixture.vault.abi,
      functionName: "withdraw",
      args: [50_000n * USDC, fixture.depositor.account.address, fixture.depositor.account.address],
    });
    const balance = await fixture.vault.read.balanceOf([fixture.depositor.account.address]);
    assert(balance >= 50_000n * USDC && balance <= 50_000n * USDC + 1000n);
    assert.equal(await fixture.asset.read.balanceOf([fixture.depositor.account.address]), 950_000n * USDC);
  });

  it("accrues adapter yield and increases share value", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 100_000n * USDC);
    await fixture.testClient.increaseTime({ seconds: 365 * 24 * 60 * 60 });
    await fixture.testClient.mine({ blocks: 1 });
    const value = await fixture.vault.read.convertToAssets([100_000n * USDC]);
    assert(value > 100_000n * USDC);
  });

  it("executes a valid atomic rebalance and records it", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 100_000n * USDC);
    const hash = keccak256(stringToHex("valid memo"));
    await fixture.agent.writeContract({
      address: fixture.vault.address,
      abi: fixture.vault.abi,
      functionName: "rebalance",
      args: [[5_500, 3_000, 1_500], hash, "bafy-valid"],
    });
    assert.deepEqual([...(await fixture.vault.read.targetWeights())], [5_500, 3_000, 1_500]);
    assert.equal(await fixture.registry.read.epoch(), 1n);
    const assets = await fixture.vault.read.totalAssets();
    assert(assets >= 100_000n * USDC && assets <= 100_000n * USDC + 1000n);
  });

  it("rejects a malicious proposal even when signed by the authorized agent", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 100_000n * USDC);
    await assert.rejects(
      fixture.agent.writeContract({
        address: fixture.vault.address,
        abi: fixture.vault.abi,
        functionName: "rebalance",
        args: [[8_000, 1_000, 1_000], keccak256(stringToHex("bad")), "bafy-bad"],
      }),
    );
    assert.equal(await fixture.registry.read.epoch(), 0n);
    assert.equal(await fixture.vault.read.totalAssets(), 100_000n * USDC);
  });

  it("rejects an unauthorized rebalance", async () => {
    const fixture = await deployProtocol();
    await assert.rejects(
      fixture.stranger.writeContract({
        address: fixture.vault.address,
        abi: fixture.vault.abi,
        functionName: "rebalance",
        args: [[5_500, 3_000, 1_500], keccak256(stringToHex("bad caller")), "bafy-caller"],
      }),
    );
  });

  it("enforces the one-hour cooldown", async () => {
    const fixture = await deployProtocol();
    await fixture.agent.writeContract({
      address: fixture.vault.address,
      abi: fixture.vault.abi,
      functionName: "rebalance",
      args: [[5_500, 3_000, 1_500], keccak256(stringToHex("one")), "bafy-one"],
    });
    await assert.rejects(
      fixture.agent.writeContract({
        address: fixture.vault.address,
        abi: fixture.vault.abi,
        functionName: "rebalance",
        args: [[5_000, 3_500, 1_500], keccak256(stringToHex("two")), "bafy-two"],
      }),
    );
    await fixture.testClient.increaseTime({ seconds: 3_601 });
    await fixture.testClient.mine({ blocks: 1 });
    await fixture.agent.writeContract({
      address: fixture.vault.address,
      abi: fixture.vault.abi,
      functionName: "rebalance",
      args: [[5_000, 3_500, 1_500], keccak256(stringToHex("two")), "bafy-two"],
    });
    assert.equal(await fixture.registry.read.epoch(), 2n);
  });

  it("allows withdrawals while paused but blocks new deposits", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 10_000n * USDC);
    await fixture.vault.write.pause();
    await fixture.asset.write.mint([fixture.depositor.account.address, 1_000n * USDC]);
    await assert.rejects(
      fixture.depositor.writeContract({
        address: fixture.vault.address,
        abi: fixture.vault.abi,
        functionName: "deposit",
        args: [1_000n * USDC, fixture.depositor.account.address],
      }),
    );
    await fixture.depositor.writeContract({
      address: fixture.vault.address,
      abi: fixture.vault.abi,
      functionName: "redeem",
      args: [1_000n * USDC, fixture.depositor.account.address, fixture.depositor.account.address],
    });
  });
});

describe("RwaTreasuryVault operational safeguards", () => {
  it("reports zero deposit and mint capacity while paused", async () => {
    const fixture = await deployProtocol();
    assert((await fixture.vault.read.maxDeposit([fixture.depositor.account.address])) > 0n);
    assert((await fixture.vault.read.maxMint([fixture.depositor.account.address])) > 0n);

    await fixture.vault.write.pause();

    assert.equal(await fixture.vault.read.maxDeposit([fixture.depositor.account.address]), 0n);
    assert.equal(await fixture.vault.read.maxMint([fixture.depositor.account.address]), 0n);
  });

  it("rejects deposits until all adapters are bound to the vault", async () => {
    const fixture = await deployProtocol({ configureAdapters: false });
    const assets = 1_000n * USDC;
    await fixture.depositor.writeContract({
      address: fixture.asset.address,
      abi: fixture.asset.abi,
      functionName: "approve",
      args: [fixture.vault.address, assets],
    });

    assert.equal(await fixture.vault.read.adaptersReady(), false);
    assert.equal(await fixture.vault.read.maxDeposit([fixture.depositor.account.address]), 0n);
    await assert.rejects(
      fixture.depositor.writeContract({
        address: fixture.vault.address,
        abi: fixture.vault.abi,
        functionName: "deposit",
        args: [assets, fixture.depositor.account.address],
      }),
    );
  });


  it("permits emergency strategy recovery only for governance while paused", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 100_000n * USDC);

    await assert.rejects(
      fixture.stranger.writeContract({
        address: fixture.vault.address,
        abi: fixture.vault.abi,
        functionName: "emergencyExitStrategy",
        args: [0n],
      }),
    );
    await assert.rejects(fixture.vault.write.emergencyExitStrategy([0n]));

    await fixture.vault.write.pause();
    const recovered = await fixture.rwa.read.totalAssets();
    await fixture.vault.write.emergencyExitStrategy([0n]);

    const vaultBal = await fixture.asset.read.balanceOf([fixture.vault.address]);
    assert(vaultBal >= recovered && vaultBal <= recovered + 1000n);
  });

  it("keeps the asset invariant after a sequence of deposits, yield and rebalance", async () => {
    const fixture = await deployProtocol();
    await approveAndDeposit(fixture, 250_000n * USDC);
    await fixture.testClient.increaseTime({ seconds: 30 * 24 * 60 * 60 });
    await fixture.testClient.mine({ blocks: 1 });

    const before = await fixture.vault.read.totalAssets();
    await fixture.agent.writeContract({
      address: fixture.vault.address,
      abi: fixture.vault.abi,
      functionName: "rebalance",
      args: [
        [5_500, 3_000, 1_500],
        keccak256(stringToHex("asset invariant")),
        "bafy-invariant",
      ],
    });
    const after = await fixture.vault.read.totalAssets();

    assert(after >= before && after <= before + 1000n);
    const strategyAssets = await fixture.vault.read.strategyAssets();
    assert.equal(
      strategyAssets[0] + strategyAssets[1] + strategyAssets[2],
      after,
    );
  });

});
