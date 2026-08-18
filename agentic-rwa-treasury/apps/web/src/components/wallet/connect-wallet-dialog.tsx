"use client";

import { MonitorSmartphone, Wallet } from "lucide-react";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { webEnv } from "@/config/env";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";

export function ConnectWalletDialog() {
  const demo = useDemoTreasury();
  const { connectors, connect, isPending } = useConnect();
  const isDemo = webEnv.appMode === "demo";

  return (
    <DialogRoot>
      <DialogTrigger render={<Button size="sm" variant="primary" />}>
        <Wallet className="size-3.5" />
        Connect wallet
      </DialogTrigger>
      <DialogContent
        description={
          isDemo
            ? "Use the deterministic local wallet to explore every vault flow without testnet funds."
            : "Connect a browser wallet configured for X Layer."
        }
        title="Connect a wallet"
      >
        <div className="grid gap-2">
          {isDemo ? (
            <DialogClose
              render={
                <Button
                  className="w-full justify-start"
                  onClick={demo.connect}
                  variant="primary"
                />
              }
            >
              <MonitorSmartphone className="size-4" />
              Use demo wallet
            </DialogClose>
          ) : connectors.length > 0 ? (
            connectors.map((connector) => (
              <Button
                className="w-full justify-start"
                key={connector.uid}
                loading={isPending}
                onClick={() => connect({ connector })}
              >
                <Wallet className="size-4" />
                {connector.name}
              </Button>
            ))
          ) : (
            <p className="rounded-[0.625rem] border border-line bg-soft p-3 text-xs leading-5 text-subtle">
              No injected wallet was detected. Install a compatible browser wallet,
              reload this page, and select X Layer.
            </p>
          )}
        </div>
        <p className="mt-3 text-xs leading-5 text-subtle">
          The agent never receives wallet custody. Deposits and withdrawals are
          standard ERC-4626 transactions signed by the user.
        </p>
      </DialogContent>
    </DialogRoot>
  );
}
