import { network } from "hardhat";

export async function deployProtocol(options: { configureAdapters?: boolean } = {}) {
  const { viem } = await network.create();
  const [admin, agent, depositor, stranger] = await viem.getWalletClients();
  if (!admin || !agent || !depositor || !stranger) throw new Error("Missing test accounts.");

  const asset = await viem.deployContract("MockUSDC", [admin.account.address]);
  const policy = await viem.deployContract("AllocationPolicy", [6_000, 2_000, 3_600]);
  const registry = await viem.deployContract("ReasoningRegistry", [admin.account.address]);
  const rwa = await viem.deployContract("RwaYieldAdapter", [asset.address, admin.account.address, 820]);
  const lending = await viem.deployContract("LendingAdapter", [asset.address, admin.account.address, 490]);
  const idle = await viem.deployContract("IdleAdapter", [asset.address, admin.account.address]);
  const vault = await viem.deployContract("RwaTreasuryVault", [
    asset.address,
    policy.address,
    registry.address,
    [rwa.address, lending.address, idle.address],
    [4_500, 3_500, 2_000],
    admin.account.address,
    agent.account.address,
  ]);

  if (options.configureAdapters !== false) {
    await rwa.write.setVault([vault.address]);
    await lending.write.setVault([vault.address]);
    await idle.write.setVault([vault.address]);
  }
  await registry.write.grantRole([await registry.read.WRITER_ROLE(), vault.address]);
  await asset.write.grantRole([await asset.read.MINTER_ROLE(), rwa.address]);
  await asset.write.grantRole([await asset.read.MINTER_ROLE(), lending.address]);
  await asset.write.mint([depositor.account.address, 1_000_000n * 10n ** 6n]);

  const publicClient = await viem.getPublicClient();
  const testClient = await viem.getTestClient();
  return { viem, publicClient, testClient, admin, agent, depositor, stranger, asset, policy, registry, vault, rwa, lending, idle };
}

export async function approveAndDeposit(
  fixture: Awaited<ReturnType<typeof deployProtocol>>,
  assets: bigint,
): Promise<void> {
  const { depositor, asset, vault } = fixture;
  await depositor.writeContract({
    address: asset.address,
    abi: asset.abi,
    functionName: "approve",
    args: [vault.address, assets],
  });
  await depositor.writeContract({
    address: vault.address,
    abi: vault.abi,
    functionName: "deposit",
    args: [assets, depositor.account.address],
  });
}
