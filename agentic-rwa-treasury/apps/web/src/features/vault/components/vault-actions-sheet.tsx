"use client";

import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  CheckCircle2,
  Coins,
  PanelRightOpen,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  DescriptionDetails,
  DescriptionDetailsNote,
  DescriptionListSection,
  DescriptionTerm,
} from "@/components/description-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsRoot,
  TabsTab,
} from "@/components/ui/tabs";
import { Typography, typographyVariants } from "@/components/ui/typography";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { cn } from "@/lib/cn";
import { formatRelativeDate, formatToken } from "@/lib/format";
import { useEffectiveAccount } from "@/lib/use-effective-account";
import type { VaultSnapshot } from "../model/types";
import { useVaultTransactions } from "../queries/use-vault-transactions";

const policyRules = [
  { label: "Strategy concentration", value: "≤ 60%" },
  { label: "One-way turnover", value: "≤ 20%" },
  { label: "Rebalance cooldown", value: "1 hour" },
  { label: "Weight sum", value: "10,000 bps" },
  { label: "Strategy set", value: "Fixed (3 adapters)" },
] as const;

type TransactionType = "deposit" | "withdraw";
type VaultActionsTab = "policy" | "funds" | "integrity";

function parseAmount(value: string): bigint | null {
  try {
    if (!value.trim()) return null;
    const amount = parseUnits(value, 6);
    return amount > 0n ? amount : null;
  } catch {
    return null;
  }
}

function preview(
  snapshot: VaultSnapshot,
  type: TransactionType,
  assets: bigint,
): bigint {
  if (snapshot.totalAssets === 0n || snapshot.totalSupply === 0n) return assets;
  if (type === "deposit") {
    return (assets * snapshot.totalSupply) / snapshot.totalAssets;
  }
  return (
    (assets * snapshot.totalSupply + snapshot.totalAssets - 1n) /
    snapshot.totalAssets
  );
}

function VaultActionsTabs({ snapshot }: { snapshot: VaultSnapshot }) {
  const [tab, setTab] = useState<VaultActionsTab>("policy");
  const [type, setType] = useState<TransactionType>("deposit");
  const account = useEffectiveAccount();
  const mutation = useVaultTransactions();
  const maximumAssets =
    type === "deposit"
      ? snapshot.userAssetBalance
      : snapshot.userPositionAssets;

  const form = useForm({
    defaultValues: { amount: "" },
    onSubmit: async ({ value }) => {
      const assets = parseAmount(value.amount);
      if (!assets) throw new Error("Enter a valid mUSDC amount.");
      await mutation.mutateAsync({ type, assets });
      form.reset();
    },
  });

  const setMaximum = () =>
    form.setFieldValue("amount", formatUnits(maximumAssets, 6));

  return (
    <TabsRoot
      onValueChange={(value) => setTab(value as VaultActionsTab)}
      value={tab}
    >
      <div className="shrink-0 border-b border-line/70 px-6">
        <TabsList className="h-11 w-full rounded-none border-0 bg-transparent p-0 shadow-none">
          <TabsTab value="policy">Policy</TabsTab>
          <TabsTab value="funds">Funds</TabsTab>
          <TabsTab value="integrity">Integrity</TabsTab>
          <TabsIndicator className="inset-x-0.5 bottom-0 top-auto h-0.5 rounded-none bg-ink shadow-none" />
        </TabsList>
      </div>

      <TabsPanel value="policy">
        <div className="px-6 py-5">
          <DescriptionListSection title="Summary">
            {policyRules.flatMap(({ label, value }) => [
              <DescriptionTerm key={`${label}-term`}>{label}</DescriptionTerm>,
              <DescriptionDetails key={`${label}-value`}>{value}</DescriptionDetails>,
            ])}
          </DescriptionListSection>
          <Typography className="mt-4 text-subtle" variant="caption">
            Hard limits evaluated on-chain before any capital moves.
          </Typography>
          <Link
            className={cn(
              typographyVariants.caption,
              "mt-4 flex h-10 items-center gap-2 rounded-[0.625rem] border border-line/70 px-3 font-medium text-accent transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-accent-soft active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
            )}
            href="/protocol/policy"
          >
            <CheckCircle2 className="size-3.5" />
            Test a malicious allocation
            <ArrowRight className="ml-auto size-3.5" />
          </Link>
        </div>
      </TabsPanel>

      <TabsPanel value="funds">
        <div className="px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Typography className="text-muted" variant="ui">
              Move mUSDC in or out of the vault.
            </Typography>
            <div className="inline-flex rounded-[0.625rem] border border-line bg-soft p-0.5">
              {(["deposit", "withdraw"] as const).map((option) => (
                <button
                  className={cn(
                    typographyVariants.caption,
                    "rounded-[0.4375rem] px-2.5 py-1 font-medium transition-colors",
                    type === option
                      ? "bg-surface text-ink shadow-sm"
                      : "text-subtle hover:text-ink",
                  )}
                  key={option}
                  onClick={() => {
                    setType(option);
                    form.reset();
                  }}
                  type="button"
                >
                  {option === "deposit" ? "Deposit" : "Withdraw"}
                </button>
              ))}
            </div>
          </div>

          <form
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
                  if (!assets) {
                    return "Enter a valid amount with at most six decimals.";
                  }
                  if (assets > maximumAssets) {
                    return `Maximum available is ${formatToken(maximumAssets)} mUSDC.`;
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const assets = parseAmount(field.state.value);
                const estimatedShares = assets
                  ? preview(snapshot, type, assets)
                  : 0n;

                return (
                  <Field
                    description={
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          {type === "deposit"
                            ? "Wallet balance"
                            : "Available position"}
                        </span>
                        <span className="number-tabular font-medium text-muted">
                          {formatToken(maximumAssets)} mUSDC
                        </span>
                      </span>
                    }
                    error={
                      field.state.meta.errors[0]
                        ? String(field.state.meta.errors[0])
                        : undefined
                    }
                    label="Amount"
                  >
                    <div className="relative">
                      <Input
                        aria-label="mUSDC amount"
                        className="h-10 pr-[7.25rem] text-[0.875rem] font-medium number-tabular"
                        inputMode="decimal"
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="0.00"
                        value={field.state.value}
                      />
                      <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                        <Typography
                          as="span"
                          className="font-medium text-muted"
                          variant="caption"
                        >
                          mUSDC
                        </Typography>
                        <button
                          className={`${typographyVariants.caption} rounded px-1.5 py-0.5 font-semibold text-accent hover:bg-accent-soft`}
                          onClick={setMaximum}
                          type="button"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    <Typography
                      as="div"
                      className="mt-2 flex max-w-none items-center justify-between rounded-[0.625rem] bg-soft px-2.5 py-2"
                      variant="caption"
                    >
                      <span className="text-subtle">
                        Estimated{" "}
                        {type === "deposit"
                          ? "shares received"
                          : "shares burned"}
                      </span>
                      <span className="number-tabular font-medium text-ink">
                        {formatToken(estimatedShares)} rtUSD
                      </span>
                    </Typography>
                  </Field>
                );
              }}
            </form.Field>

            <div className="mt-4">
              {account.connected ? (
                <form.Subscribe
                  selector={(state) =>
                    [
                      state.canSubmit,
                      state.isSubmitting,
                      state.values.amount,
                    ] as const
                  }
                >
                  {([canSubmit, isSubmitting, amount]) => (
                    <Button
                      className="w-full"
                      disabled={
                        !canSubmit || !parseAmount(amount) || snapshot.paused
                      }
                      leadingIcon={
                        type === "deposit" ? (
                          <ArrowDownToLine className="size-3.5" />
                        ) : (
                          <ArrowUpFromLine className="size-3.5" />
                        )
                      }
                      loading={Boolean(isSubmitting) || mutation.isPending}
                      type="submit"
                      variant="primary"
                    >
                      {snapshot.paused
                        ? "Vault paused"
                        : type === "deposit"
                          ? "Deposit mUSDC"
                          : "Withdraw mUSDC"}
                    </Button>
                  )}
                </form.Subscribe>
              ) : (
                <ConnectWalletButton />
              )}
            </div>

            <Typography
              as="div"
              className="mt-3 flex max-w-none items-start gap-2 text-subtle"
              variant="caption"
            >
              {type === "deposit" ? (
                <Coins className="mt-0.5 size-3 shrink-0" />
              ) : (
                <Wallet className="mt-0.5 size-3 shrink-0" />
              )}
              <span>
                {type === "deposit"
                  ? "Live mode approves only the entered amount before depositing."
                  : "Idle, lending, and RWA liquidity resolve in one atomic transaction."}
              </span>
            </Typography>
          </form>
        </div>
      </TabsPanel>

      <TabsPanel value="integrity">
        <div className="px-6 py-5">
          <DescriptionListSection title="Summary">
            <DescriptionTerm>Latest commitment</DescriptionTerm>
            <DescriptionDetails className="[font-variant-numeric:normal]">
              Registry hash + CID
              <DescriptionDetailsNote>
                {formatRelativeDate(snapshot.lastRebalanceAt * 1_000)}
              </DescriptionDetailsNote>
            </DescriptionDetails>
            <DescriptionTerm>Verification</DescriptionTerm>
            <DescriptionDetails className="[font-variant-numeric:normal]">
              User initiated
              <DescriptionDetailsNote>
                Browser, IPFS, X Layer
              </DescriptionDetailsNote>
            </DescriptionDetails>
            <DescriptionTerm>Status</DescriptionTerm>
            <DescriptionDetails className="[font-variant-numeric:normal]">
              Committed
            </DescriptionDetails>
          </DescriptionListSection>
          <Typography className="mt-4 text-subtle" variant="caption">
            Every completed rebalance stores exact memo bytes on-chain.
          </Typography>
          <Link
            className={cn(
              typographyVariants.caption,
              "mt-4 flex h-10 items-center gap-2 rounded-[0.625rem] border border-line/70 px-3 font-medium text-accent transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-accent-soft active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
            )}
            href="/decisions"
          >
            Verify a committed decision
            <ArrowRight className="ml-auto size-3.5" />
          </Link>
        </div>
      </TabsPanel>
    </TabsRoot>
  );
}

export function VaultActionsSheet({
  snapshot,
}: {
  snapshot: VaultSnapshot;
}) {
  return (
    <Sheet swipeDirection="right">
      <SheetTrigger
        render={
          <Button
            leadingIcon={<PanelRightOpen className="size-3.5" />}
            size="sm"
            variant="secondary"
          />
        }
      >
        Vault controls
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetClose
            className="absolute right-4 top-4"
            render={<IconButton aria-label="Close sheet" />}
          >
            <X aria-hidden="true" className="size-3.5" />
          </SheetClose>
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <SheetTitle>Vault controls</SheetTitle>
              <SheetDescription>
                Policy bounds, deposits, and reasoning integrity in one place.
              </SheetDescription>
            </div>
            <Badge className="border-success/20 bg-success-soft text-success">
              <ShieldCheck className="size-3" />
              On-chain
            </Badge>
          </div>
        </SheetHeader>
        <SheetBody>
          <VaultActionsTabs snapshot={snapshot} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
