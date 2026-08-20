"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MonitorSmartphone, Wallet } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { webEnv } from "@/config/env";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";

export function ConnectWalletButton({
  className,
  children = "Connect wallet",
  ...props
}: Omit<ButtonProps, "onClick">) {
  const demo = useDemoTreasury();

  if (webEnv.appMode === "demo") {
    return (
      <Button
        className={className}
        leadingIcon={<MonitorSmartphone className="size-3.5" />}
        onClick={demo.connect}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ mounted, account, chain, openChainModal, openConnectModal }) => {
        if (!mounted) {
          return <Button className={className} disabled {...props}>Restoring wallet</Button>;
        }
        if (!account || !chain) {
          return (
            <Button
              className={className}
              leadingIcon={<Wallet className="size-3.5" />}
              onClick={openConnectModal}
              {...props}
            >
              {children}
            </Button>
          );
        }
        if (chain.unsupported) {
          return <Button className={className} onClick={openChainModal} variant="danger">Switch network</Button>;
        }
        return null;
      }}
    </ConnectButton.Custom>
  );
}
