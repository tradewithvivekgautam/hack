"use client";

import {
  ArrowRight,
  CircleDollarSign,
  History,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { webEnv } from "@/config/env";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";
import { formatToken, formatTokenUsd } from "@/lib/format";
import { useEffectiveAccount } from "@/lib/use-effective-account";
import type { VaultSnapshot } from "../model/types";
import { useVaultTransactions } from "../queries/use-vault-transactions";

export function VaultContextRail({ snapshot }: { snapshot: VaultSnapshot }) {
  const account = useEffectiveAccount();
  const demo = useDemoTreasury();
  const mutation = useVaultTransactions();
  const faucetAvailable =
    snapshot.mode === "demo" ||
    webEnv.defaultChainId === 31_337 ||
    webEnv.defaultChainId === 1_952;

  const claimAssets = () => mutation.mutate({ type: "faucet" });

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b border-line px-4">
        <span className="text-[0.8125rem] font-semibold text-ink">
          Vault context
        </span>
        <Badge
          className={
            snapshot.mode === "demo"
              ? "border-warning/20 bg-warning-soft text-warning"
              : "border-success/20 bg-success-soft text-success"
          }
        >
          {snapshot.mode === "demo" ? "Demo" : "Live"}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="rounded-[0.875rem] border border-line bg-surface p-3">
          <div className="flex items-center gap-2 text-xs text-subtle">
            <WalletCards className="size-3.5" />
            Your position
          </div>
          <div className="number-tabular mt-2 text-[1rem] font-semibold tracking-[-0.03em] text-ink">
            {formatTokenUsd(snapshot.userPositionAssets)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-subtle">
            <span>{formatToken(snapshot.userShareBalance)} rtUSD</span>
            <span>1 rtUSD = ${snapshot.sharePrice.toFixed(4)}</span>
          </div>
          {!account.connected ? (
            <p className="mt-3 rounded-[0.625rem] bg-soft p-2 text-xs leading-4 text-subtle">
              Connect a wallet to reveal your live position and transact.
            </p>
          ) : null}
        </div>

        <div className="mt-4 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
          Available
        </div>
        <div className="mt-1 grid gap-1">
          <div className="flex h-9 items-center gap-2 rounded-[0.5rem] px-2 text-xs text-muted">
            <CircleDollarSign className="size-3.5" />
            <span className="flex-1">Wallet mUSDC</span>
            <span className="number-tabular font-medium text-ink">
              {formatToken(snapshot.userAssetBalance)}
            </span>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-[0.5rem] px-2 text-xs text-muted">
            <ShieldCheck className="size-3.5" />
            <span className="flex-1">Vault state</span>
            <span
              className={
                snapshot.paused
                  ? "font-medium text-danger"
                  : "font-medium text-success"
              }
            >
              {snapshot.paused ? "Paused" : "Active"}
            </span>
          </div>
        </div>

        {faucetAvailable ? (
          <div className="mt-4 rounded-[0.875rem] border border-line bg-surface p-3">
            <p className="text-xs font-medium text-ink">
              {snapshot.mode === "demo" ? "Demo assets" : "Test assets"}
            </p>
            <p className="mt-1 text-xs leading-4 text-subtle">
              {snapshot.mode === "demo"
                ? "Mint local mUSDC to exercise deposit and withdrawal without a network faucet."
                : "Claim mUSDC from the deployed permissionless test faucet contract."}
            </p>
            <Button
              className="mt-3 w-full"
              disabled={mutation.isPending || !account.connected}
              loading={
                mutation.isPending && mutation.variables?.type === "faucet"
              }
              onClick={claimAssets}
              size="sm"
            >
              Claim 10,000 mUSDC
            </Button>
            {!account.connected ? (
              <p className="mt-2 text-center text-xs text-subtle">
                Connect a wallet first.
              </p>
            ) : null}
            {snapshot.mode === "demo" ? (
              <button
                className="mt-2 w-full text-center text-xs text-subtle hover:text-ink"
                onClick={demo.reset}
                type="button"
              >
                Reset demo state
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
          Navigate
        </div>
        <div className="mt-1 grid gap-1">
          <Link
            className="flex h-9 items-center gap-2 rounded-[0.5rem] px-2 text-xs text-muted hover:bg-soft hover:text-ink"
            href="/decisions"
          >
            <History className="size-3.5" />
            Decision history
            <ArrowRight className="ml-auto size-3.5" />
          </Link>
          <Link
            className="flex h-9 items-center gap-2 rounded-[0.5rem] px-2 text-xs text-muted hover:bg-soft hover:text-ink"
            href="/protocol"
          >
            <ShieldCheck className="size-3.5" />
            Protocol controls
            <ArrowRight className="ml-auto size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
