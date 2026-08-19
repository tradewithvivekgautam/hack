"use client";

import { erc20Abi, mockUsdcAbi, vaultAbi } from "@agentic-rwa/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { assertLiveConfiguration, webEnv } from "@/config/env";
import { errorMessage } from "@/lib/errors";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";
import { vaultQueryKey } from "./use-vault-snapshot";

export type VaultTransaction =
  | { type: "deposit"; assets: bigint }
  | { type: "withdraw"; assets: bigint }
  | { type: "faucet"; assets?: bigint };

export function useVaultTransactions() {
  const demo = useDemoTreasury();
  const account = useAccount();
  const chainId = useChainId();
  const client = usePublicClient({ chainId: webEnv.defaultChainId });
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: VaultTransaction) => {
      if (webEnv.appMode === "demo") {
        if (transaction.type === "deposit") return demo.deposit(transaction.assets);
        if (transaction.type === "withdraw") return demo.withdraw(transaction.assets);
        return demo.faucet();
      }

      assertLiveConfiguration();
      if (!account.address) throw new Error("Connect a wallet before submitting a transaction.");
      if (!client) throw new Error("X Layer RPC client is unavailable.");
      if (chainId !== webEnv.defaultChainId) {
        try {
          await switchChainAsync({ chainId: webEnv.defaultChainId });
        } catch {
          // ignore switch failure if wallet already handles RPC
        }
      }

      // 1. Try seamless server relayer for instant on-chain execution
      try {
        const relayResponse = await fetch("/api/vault/relay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: transaction.type,
            address: account.address,
            amount: (transaction.assets || (10_000n * 10n ** 6n)).toString(),
          }),
        });
        if (relayResponse.ok) {
          const relayResult = await relayResponse.json();
          if (relayResult.hash) {
            return { hash: relayResult.hash as `0x${string}`, amount: transaction.assets };
          }
        }
      } catch {
        // fallback to direct wallet signing
      }

      // 2. Direct wallet signing fallback
      if (transaction.type === "faucet") {
        const amount = transaction.assets ?? 10_000n * 10n ** 6n;
        const hash = await writeContractAsync({
          address: webEnv.contracts.asset,
          abi: mockUsdcAbi,
          functionName: "faucet",
          args: [amount],
        });
        await client.waitForTransactionReceipt({ hash });
        return { hash, amount };
      }

      if (transaction.type === "deposit") {
        const allowance = await client.readContract({
          address: webEnv.contracts.asset,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account.address, webEnv.contracts.vault],
        });
        if (allowance < transaction.assets) {
          const approvalHash = await writeContractAsync({
            address: webEnv.contracts.asset,
            abi: erc20Abi,
            functionName: "approve",
            args: [webEnv.contracts.vault, transaction.assets],
          });
          await client.waitForTransactionReceipt({ hash: approvalHash });
        }
        const hash = await writeContractAsync({
          address: webEnv.contracts.vault,
          abi: vaultAbi,
          functionName: "deposit",
          args: [transaction.assets, account.address],
        });
        await client.waitForTransactionReceipt({ hash });
        return { hash, amount: transaction.assets };
      }

      const hash = await writeContractAsync({
        address: webEnv.contracts.vault,
        abi: vaultAbi,
        functionName: "withdraw",
        args: [transaction.assets, account.address, account.address],
      });
      await client.waitForTransactionReceipt({ hash });
      return { hash, amount: transaction.assets };
    },
    onSuccess: async (_result, transaction) => {
      await queryClient.invalidateQueries({ queryKey: vaultQueryKey });
      const labels = { deposit: "Deposit confirmed", withdraw: "Withdrawal confirmed", faucet: "mUSDC received" } as const;
      toast.success(labels[transaction.type], {
        description: transaction.type === "faucet" ? "Test assets are now available in your wallet." : "The confirmed vault state is being refreshed.",
      });
    },
    onError: (error) => {
      toast.error("Transaction did not complete", { description: errorMessage(error) });
    },
  });
}
