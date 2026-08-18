"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowDownToLine, ArrowUpFromLine, Coins, Wallet } from "lucide-react";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ConnectWalletDialog } from "@/components/wallet/connect-wallet-dialog";
import { formatToken } from "@/lib/format";
import { useEffectiveAccount } from "@/lib/use-effective-account";
import type { VaultSnapshot } from "../model/types";
import { useVaultTransactions } from "../queries/use-vault-transactions";

type TransactionType = "deposit" | "withdraw";

function parseAmount(value: string): bigint | null {
  try {
    if (!value.trim()) return null;
    const amount = parseUnits(value, 6);
    return amount > 0n ? amount : null;
  } catch {
    return null;
  }
}

function preview(snapshot: VaultSnapshot, type: TransactionType, assets: bigint): bigint {
  if (snapshot.totalAssets === 0n || snapshot.totalSupply === 0n) return assets;
  if (type === "deposit") return (assets * snapshot.totalSupply) / snapshot.totalAssets;
  return (assets * snapshot.totalSupply + snapshot.totalAssets - 1n) / snapshot.totalAssets;
}

export function TransactionCard({ snapshot }: { snapshot: VaultSnapshot }) {
  const [type, setType] = useState<TransactionType>("deposit");
  const account = useEffectiveAccount();
  const mutation = useVaultTransactions();
  const maximumAssets = type === "deposit" ? snapshot.userAssetBalance : snapshot.userPositionAssets;

  const form = useForm({
    defaultValues: { amount: "" },
    onSubmit: async ({ value }) => {
      const assets = parseAmount(value.amount);
      if (!assets) throw new Error("Enter a valid mUSDC amount.");
      await mutation.mutateAsync({ type, assets });
      form.reset();
    },
  });

  const setMaximum = () => form.setFieldValue("amount", formatUnits(maximumAssets, 6));

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Move funds"
        description="Deposit mUSDC for rtUSD shares or redeem assets on demand."
        action={
          <SegmentedControl
            items={[
              { value: "deposit", label: "Deposit" },
              { value: "withdraw", label: "Withdraw" },
            ]}
            onValueChange={(next) => {
              setType(next);
              form.reset();
            }}
            value={type}
          />
        }
      />
      <form
        className="p-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit().catch(() => undefined);
        }}
      >
        <form.Field
          name="amount"
          validators={{
            onChange: ({ value }) => {
              if (!value) return undefined;
              const assets = parseAmount(value);
              if (!assets) return "Enter a valid amount with at most six decimals.";
              if (assets > maximumAssets) return `Maximum available is ${formatToken(maximumAssets)} mUSDC.`;
              return undefined;
            },
          }}
        >
          {(field) => {
            const assets = parseAmount(field.state.value);
            const estimatedShares = assets ? preview(snapshot, type, assets) : 0n;
            return (
              <Field
                description={
                  <span className="flex items-center justify-between gap-3">
                    <span>{type === "deposit" ? "Wallet balance" : "Available position"}</span>
                    <span className="font-medium text-muted number-tabular">{formatToken(maximumAssets)} mUSDC</span>
                  </span>
                }
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
                label="Amount"
              >
                <div className="relative">
                  <Input
                    aria-label="mUSDC amount"
                    className="h-10 pr-[7.25rem] text-[0.875rem] font-medium number-tabular"
                    inputMode="decimal"
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="0.00"
                    value={field.state.value}
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted">mUSDC</span>
                    <button className="rounded px-1.5 py-0.5 text-xs font-semibold text-accent hover:bg-accent-soft" onClick={setMaximum} type="button">
                      Max
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-[0.625rem] bg-soft px-2.5 py-2 text-xs">
                  <span className="text-subtle">Estimated {type === "deposit" ? "shares received" : "shares burned"}</span>
                  <span className="font-medium text-ink number-tabular">{formatToken(estimatedShares)} rtUSD</span>
                </div>
              </Field>
            );
          }}
        </form.Field>

        <div className="mt-4">
          {account.connected ? (
            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting, state.values.amount] as const
              }
            >
              {([canSubmit, isSubmitting, amount]) => (
                <Button
                  className="w-full"
                  disabled={!canSubmit || !parseAmount(amount) || snapshot.paused}
                  leadingIcon={type === "deposit" ? <ArrowDownToLine className="size-3.5" /> : <ArrowUpFromLine className="size-3.5" />}
                  loading={Boolean(isSubmitting) || mutation.isPending}
                  type="submit"
                  variant="primary"
                >
                  {snapshot.paused ? "Vault paused" : type === "deposit" ? "Deposit mUSDC" : "Withdraw mUSDC"}
                </Button>
              )}
            </form.Subscribe>
          ) : (
            <ConnectWalletDialog />
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs leading-4 text-subtle">
          {type === "deposit" ? <Coins className="mt-0.5 size-3 shrink-0" /> : <Wallet className="mt-0.5 size-3 shrink-0" />}
          <span>
            {type === "deposit"
              ? "Live mode approves only the entered amount before depositing. The demo performs the same accounting without a wallet signature."
              : "The vault sources idle liquidity first, then lending, then the RWA adapter, in one atomic transaction."}
          </span>
        </div>
      </form>
    </Panel>
  );
}
