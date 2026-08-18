import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { network } from "hardhat";
import { getAddress, zeroAddress } from "viem";

async function main(): Promise<void> {
  const connection = await network.connect();
  const { viem, networkName } = connection;
  const [deployer] = await viem.getWalletClients();
  if (!deployer) throw new Error("No deployer account is configured.");

  const deployerAddress = getAddress(deployer.account.address);
  const admin = getAddress(process.env.ADMIN_ADDRESS || deployerAddress);
  const agent = getAddress(process.env.AGENT_ADDRESS || deployerAddress);

  // The deployer is a temporary configurator. Governance is transferred only
  // after adapters and registry permissions are wired exactly once.
  const asset = await viem.deployContract("MockUSDC", [deployerAddress]);
  const policy = await viem.deployContract("AllocationPolicy", [
    6_000,
    2_000,
    3_600,
  ]);
  const registry = await viem.deployContract("ReasoningRegistry", [
    deployerAddress,
  ]);
  const rwa = await viem.deployContract("RwaYieldAdapter", [
    asset.address,
    deployerAddress,
    820,
  ]);
  const lending = await viem.deployContract("LendingAdapter", [
    asset.address,
    deployerAddress,
    490,
  ]);
  const idle = await viem.deployContract("IdleAdapter", [
    asset.address,
    deployerAddress,
  ]);
  const vault = await viem.deployContract("RwaTreasuryVault", [
    asset.address,
    policy.address,
    registry.address,
    [rwa.address, lending.address, idle.address],
    [4_500, 3_500, 2_000],
    admin,
    agent,
  ]);

  await rwa.write.setVault([vault.address]);
  await lending.write.setVault([vault.address]);
  await idle.write.setVault([vault.address]);

  const writerRole = await registry.read.WRITER_ROLE();
  await registry.write.grantRole([writerRole, vault.address]);

  const minterRole = await asset.read.MINTER_ROLE();
  await asset.write.grantRole([minterRole, rwa.address]);
  await asset.write.grantRole([minterRole, lending.address]);

  if ((networkName === "hardhatMainnet" || networkName === "localhost")) {
    await asset.write.mint([deployerAddress, 1_000_000n * 10n ** 6n]);
  }

  // Production/testnet deployers do not retain arbitrary mUSDC mint power.
  if ((networkName !== "hardhatMainnet" && networkName !== "localhost")) {
    await asset.write.revokeRole([minterRole, deployerAddress]);
  }

  if (admin !== deployerAddress) {
    const assetAdminRole = await asset.read.DEFAULT_ADMIN_ROLE();
    const registryAdminRole = await registry.read.DEFAULT_ADMIN_ROLE();

    await asset.write.grantRole([assetAdminRole, admin]);
    await registry.write.grantRole([registryAdminRole, admin]);
    await asset.write.renounceRole([assetAdminRole, deployerAddress]);
    await registry.write.renounceRole([registryAdminRole, deployerAddress]);
  }

  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  const block = await publicClient.getBlockNumber();
  const deployment = {
    schemaVersion: "1.0.0",
    chainId,
    deployedAt: new Date().toISOString(),
    deploymentBlock: block.toString(),
    deployer: deployerAddress,
    admin,
    agent,
    asset: asset.address,
    policy: policy.address,
    registry: registry.address,
    vault: vault.address,
    adapters: {
      rwa: rwa.address,
      lending: lending.address,
      idle: idle.address,
    },
  };

  if (deployment.vault === zeroAddress) {
    throw new Error("Vault deployment returned the zero address.");
  }

  const directory = resolve(process.cwd(), "..", "deployments");
  await mkdir(directory, { recursive: true });
  await writeFile(
    resolve(directory, `chain-${chainId}.json`),
    `${JSON.stringify(deployment, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(deployment, null, 2));
}

await main();
