"use client";
import { ChevronDown, Wallet } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { webEnv } from "@/config/env";
import { formatAddress } from "@/lib/format";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";
import { Button } from "@/components/ui/button";
import { ConnectWalletDialog } from "./connect-wallet-dialog";

export function WalletButton() {
  const demo = useDemoTreasury();
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const connected = webEnv.appMode === "demo" ? demo.connected : account.isConnected;
  const address = webEnv.appMode === "demo" ? demo.address : account.address;
  if (!connected || !address) return <ConnectWalletDialog />;
  return <Button variant="secondary" size="sm" onClick={() => webEnv.appMode === "demo" ? demo.disconnect() : disconnect()}><Wallet className="size-3.5" /><span>{formatAddress(address)}</span><ChevronDown className="size-3" /></Button>;
}
