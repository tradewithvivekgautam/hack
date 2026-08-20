"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, Wallet } from "lucide-react";
import { webEnv } from "@/config/env";
import { formatAddress } from "@/lib/format";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  const demo = useDemoTreasury();

  if (webEnv.appMode === "demo") {
    return (
      <Button onClick={demo.disconnect} size="sm" variant="secondary">
        <Wallet className="size-3.5" />
        <span>{formatAddress(demo.address)}</span>
        <ChevronDown className="size-3" />
      </Button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ mounted, account, chain, openAccountModal, openChainModal, openConnectModal }) => {
        if (!mounted) return <span className="h-7 w-24 rounded-[0.5rem] bg-soft" />;
        if (!account || !chain) {
          return <Button onClick={openConnectModal} size="sm" variant="primary">Connect wallet</Button>;
        }
        if (chain.unsupported) {
          return <Button onClick={openChainModal} size="sm" variant="danger">Wrong network</Button>;
        }
        return (
          <Button onClick={openAccountModal} size="sm" variant="secondary">
            <Wallet className="size-3.5" />
            <span>{account.displayName}</span>
            <ChevronDown className="size-3" />
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
