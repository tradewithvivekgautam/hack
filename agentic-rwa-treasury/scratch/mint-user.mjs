import { createWalletClient, createPublicClient, http, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const mintAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
];

async function main() {
  // Let's get the user's address from the screenshot:
  // The first 40 hex chars after 0x: 5a93d2ad2342bf9ed3fdd2e842878d0c24f97323 -> 5a93d2ad2342bf9ed3fdd2e842878d0c24f97323 without extra 3
  const rawAddress = "0x5a93d2ad2342bf9ed3fdd2e842878d0c24f97323".slice(0, 42);
  const userAddress = getAddress(rawAddress);
  const mockUsdcAddress = getAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  
  console.log(`Funding user ${userAddress} with 10 ETH and 50,000 mUSDC...`);

  // 1. Fund user with 10 ETH for gas via hardhat_setBalance
  await fetch("http://127.0.0.1:8545", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "hardhat_setBalance",
      params: [userAddress, "0x8ac7230489e80000"], // 10 ETH
      id: 1,
    }),
  });

  // 2. Mint 50,000 mUSDC directly to user using deployer account (Account #0)
  const deployer = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  const client = createWalletClient({
    account: deployer,
    transport: http("http://127.0.0.1:8545"),
  });
  const publicClient = createPublicClient({
    transport: http("http://127.0.0.1:8545"),
  });

  const hash = await client.writeContract({
    address: mockUsdcAddress,
    abi: mintAbi,
    functionName: "mint",
    args: [userAddress, 50_000n * 10n ** 6n],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Successfully minted 50,000 mUSDC to ${userAddress}! Tx: ${hash}`);
}

main().catch(console.error);
