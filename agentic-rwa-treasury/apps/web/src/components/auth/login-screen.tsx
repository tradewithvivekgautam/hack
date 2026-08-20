"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRight, CheckCircle2, ShieldCheck, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/shell/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Typography } from "@/components/ui/typography";
import { webEnv } from "@/config/env";
import { useDemoTreasury } from "@/lib/demo/demo-treasury";
import { useEffectiveAccount } from "@/lib/use-effective-account";

export function LoginScreen({ nextPath }: { nextPath: string }) {
  const account = useEffectiveAccount();
  const demo = useDemoTreasury();
  const router = useRouter();

  useEffect(() => {
    if (account.connected) router.replace(nextPath);
  }, [account.connected, nextPath, router]);

  const enterDemo = () => {
    demo.connect();
    router.replace(nextPath);
  };

  return (
    <main className="min-h-dvh bg-canvas p-2 sm:p-4">
      <div className="grid min-h-[calc(100dvh-1rem)] overflow-hidden rounded-[0.875rem] border border-line bg-app shadow-[var(--shadow-frame)] sm:min-h-[calc(100dvh-2rem)] lg:grid-cols-[minmax(18rem,0.78fr)_minmax(26rem,1.22fr)]">
        <section className="hidden border-r border-line bg-nav-secondary p-8 lg:flex lg:flex-col lg:justify-between">
          <Logo />
          <div className="max-w-[28rem]">
            <IconTile className="mb-5 size-10" tone="orange">
              <ShieldCheck className="size-5" strokeWidth={1.6} />
            </IconTile>
            <Typography as="h1" className="text-ink" variant="heading">
              Model judgment. Contract custody.
            </Typography>
            <Typography className="mt-2 text-muted" variant="body">
              Connect your wallet to inspect the treasury, verify decisions,
              and sign standard ERC-4626 transactions.
            </Typography>
          </div>
          <Typography className="text-subtle" variant="caption">
            Agent never receives wallet custody.
          </Typography>
        </section>

        <section className="grid place-items-center p-5 sm:p-8">
          <Card className="w-full max-w-[25rem] overflow-hidden">
            <CardHeader
              action={<Badge>{webEnv.appMode === "demo" ? "Demo" : "Live"}</Badge>}
              description="Your wallet address becomes your local application identity. No password or custodial account."
              title="Connect to Arca"
            />
            <CardContent className="grid gap-3">
              <div className="grid gap-2 rounded-[0.625rem] bg-soft p-3">
                <LoginFact text="Wallet stays self-custodied" />
                <LoginFact text="Network and account remain visible" />
                <LoginFact text="Disconnect ends this browser session" />
              </div>

              {webEnv.appMode === "demo" ? (
                <Button
                  className="w-full"
                  onClick={enterDemo}
                  trailingIcon={<ArrowRight className="size-3.5" />}
                  variant="primary"
                >
                  Enter demo
                </Button>
              ) : (
                <ConnectButton.Custom>
                  {({
                    mounted,
                    account: walletAccount,
                    chain,
                    openChainModal,
                    openConnectModal,
                  }) => {
                    const ready = mounted;
                    const connected = ready && walletAccount && chain;
                    if (!ready) {
                      return <Button className="w-full" disabled>Restoring wallet</Button>;
                    }
                    if (!connected) {
                      return (
                        <Button
                          className="w-full"
                          onClick={openConnectModal}
                          leadingIcon={<WalletCards className="size-3.5" />}
                          trailingIcon={<ArrowRight className="size-3.5" />}
                          variant="primary"
                        >
                          Connect wallet
                        </Button>
                      );
                    }
                    if (chain.unsupported) {
                      return (
                        <Button className="w-full" onClick={openChainModal} variant="danger">
                          Switch network
                        </Button>
                      );
                    }
                    return <Button className="w-full" disabled>Opening treasury</Button>;
                  }}
                </ConnectButton.Custom>
              )}

              {!webEnv.walletConnectConfigured && webEnv.appMode === "live" ? (
                <Typography className="text-warning" variant="caption">
                  WalletConnect project ID is missing. Injected browser wallets
                  remain available; QR wallet connections require
                  `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function LoginFact({ text }: { text: string }) {
  return (
    <Typography className="flex items-center gap-2 text-muted" variant="ui">
      <CheckCircle2 className="size-3.5 shrink-0 text-success" />
      {text}
    </Typography>
  );
}
