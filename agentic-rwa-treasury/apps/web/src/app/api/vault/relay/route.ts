import { createWalletClient, createPublicClient, http, getAddress, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhatLocal } from "@agentic-rwa/shared";
import { webEnv } from "@/config/env";

const erc20Abi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  }
];

const vaultAbi = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" }
    ],
    outputs: [{ name: "shares", type: "uint256" }]
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, address, amount } = body;

    if (!address) {
      return new Response(JSON.stringify({ error: "Missing wallet address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userAddress = getAddress(address);
    const parsedAmount = BigInt(amount || "10000000000"); // default 10k USDC (6 decimals)

    // Deployer account on Hardhat Local (Account #0)
    const relayerAccount = privateKeyToAccount(
      (process.env["RELAYER_PRIVATE_KEY"] as `0x${string}`) ||
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );

    const rpcUrl = webEnv.localRpcUrl || "http://127.0.0.1:8545";
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: hardhatLocal,
      transport: http(rpcUrl),
    });

    const publicClient = createPublicClient({
      chain: hardhatLocal,
      transport: http(rpcUrl),
    });

    // 1. Ensure user has ETH for balance
    try {
      await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "hardhat_setBalance",
          params: [userAddress, "0x8ac7230489e80000"], // 10 ETH
          id: 1,
        }),
      });
    } catch {
      // ignore if on live network without hardhat_setBalance
    }

    if (action === "faucet") {
      // Mint mUSDC to user directly
      const hash = await walletClient.writeContract({
        address: webEnv.contracts.asset,
        abi: erc20Abi,
        functionName: "mint",
        args: [userAddress, parsedAmount],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return new Response(JSON.stringify({ success: true, hash, amount: parsedAmount.toString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "deposit") {
      // Mint mUSDC to the relayer, approve the vault, and deposit with receiver = userAddress
      // This directly mints real rtUSD share tokens to userAddress on the blockchain!
      const mintHash = await walletClient.writeContract({
        address: webEnv.contracts.asset,
        abi: erc20Abi,
        functionName: "mint",
        args: [relayerAccount.address, parsedAmount],
      });
      await publicClient.waitForTransactionReceipt({ hash: mintHash });

      const approveHash = await walletClient.writeContract({
        address: webEnv.contracts.asset,
        abi: erc20Abi,
        functionName: "approve",
        args: [webEnv.contracts.vault, parsedAmount],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      const depositHash = await walletClient.writeContract({
        address: webEnv.contracts.vault,
        abi: vaultAbi,
        functionName: "deposit",
        args: [parsedAmount, userAddress],
      });
      await publicClient.waitForTransactionReceipt({ hash: depositHash });

      return new Response(JSON.stringify({ success: true, hash: depositHash, amount: parsedAmount.toString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "withdraw") {
      // Impersonate user address on local chain to execute withdrawal smoothly
      try {
        await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "hardhat_impersonateAccount",
            params: [userAddress],
            id: 1,
          }),
        });

        const impersonatedClient = createWalletClient({
          account: userAddress,
          chain: hardhatLocal,
          transport: http(rpcUrl),
        });

        const withdrawHash = await impersonatedClient.writeContract({
          address: webEnv.contracts.vault,
          abi: [
            {
              type: "function",
              name: "withdraw",
              stateMutability: "nonpayable",
              inputs: [
                { name: "assets", type: "uint256" },
                { name: "receiver", type: "address" },
                { name: "owner", type: "address" },
              ],
              outputs: [{ name: "shares", type: "uint256" }],
            },
          ],
          functionName: "withdraw",
          args: [parsedAmount, userAddress, userAddress],
        });

        await publicClient.waitForTransactionReceipt({ hash: withdrawHash });

        return new Response(JSON.stringify({ success: true, hash: withdrawHash, amount: parsedAmount.toString() }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (withdrawErr: any) {
        console.error("Relay withdraw error:", withdrawErr);
      }
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), { status: 400 });
  } catch (err: any) {
    console.error("Relay error:", err);
    return new Response(JSON.stringify({ error: err.message || "Relay transaction failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
