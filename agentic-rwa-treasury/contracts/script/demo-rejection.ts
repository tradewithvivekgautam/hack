import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { network } from "hardhat";
import { getAddress, keccak256, parseAbi, stringToHex } from "viem";

const vaultAbi = parseAbi([
  "function rebalance(uint16[3] proposedWeights, bytes32 reasoningHash, string reasoningCid) returns (uint256)",
]);

const deployment = JSON.parse(
  await readFile(
    resolve(process.cwd(), "..", "deployments", "chain-1952.json"),
    "utf8",
  ),
) as { vault: `0x${string}` };

const { viem } = await network.connect();
const [agent] = await viem.getWalletClients();
if (!agent) throw new Error("No agent account is configured.");

let rejected = false;
try {
  await agent.writeContract({
    address: getAddress(deployment.vault),
    abi: vaultAbi,
    functionName: "rebalance",
    args: [
      [8_000, 1_000, 1_000],
      keccak256(stringToHex("malicious-demo")),
      "demo-invalid",
    ],
  });
} catch (error) {
  rejected = true;
  console.log(
    "✓ Authorized-agent proposal was rejected before any funds moved or decision was recorded.",
  );
  console.log(error instanceof Error ? error.message : String(error));
}

if (!rejected) {
  throw new Error(
    "Unexpected success: AllocationPolicy should reject an 80% strategy weight.",
  );
}
