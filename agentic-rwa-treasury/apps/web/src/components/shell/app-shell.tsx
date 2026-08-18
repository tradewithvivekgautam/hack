"use client";

import { CircleHelp, Code2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/wallet/wallet-button";
import { webEnv } from "@/config/env";
import { primaryNavigation } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

export function AppShell({
  context,
  children,
}: {
  context: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const networkLabel =
    webEnv.defaultChainId === 31_337
      ? "local"
      : webEnv.defaultChainId === 196
        ? "mainnet"
        : "testnet";
  const repositoryUrl = webEnv.repositoryUrl ?? "/protocol";
  const repositoryLinkProps = webEnv.repositoryUrl
    ? { rel: "noreferrer", target: "_blank" as const }
    : {};

  return (
    <div className="min-h-screen bg-canvas p-0 sm:p-4 xl:p-8">
      <div
        className="isolate mx-auto min-h-screen max-w-[112rem] overflow-hidden border border-white/70 bg-app shadow-[0_1.5rem_5rem_rgba(20,20,20,0.08)] sm:min-h-[calc(100vh-2rem)] sm:rounded-[1.5rem] xl:min-h-[calc(100vh-4rem)]"
        id="app-root"
      >
        <div className="grid min-h-[inherit] grid-cols-1 lg:grid-cols-[14.5rem_15.25rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-line bg-nav lg:flex lg:flex-col">
            <div className="flex h-14 items-center border-b border-line px-4">
              <Logo />
            </div>
            <nav className="flex-1 p-3">
              <div className="grid gap-1">
                {primaryNavigation.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      className={cn(
                        "flex h-8 items-center gap-2.5 rounded-[0.5rem] px-2.5 text-[0.8125rem] font-medium text-muted transition-colors hover:bg-soft hover:text-ink",
                        active && "bg-soft text-ink",
                      )}
                      href={href}
                      key={href}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </Link>
                  );
                })}
              </div>
              <div className="my-3 h-px bg-line" />
              <div className="px-2.5 pb-1 text-xs font-medium uppercase tracking-[0.08em] text-subtle">
                System
              </div>
              <a
                className="flex h-8 items-center gap-2.5 rounded-[0.5rem] px-2.5 text-xs text-muted hover:bg-soft hover:text-ink"
                href={repositoryUrl}
                {...repositoryLinkProps}
              >
                <Code2 className="size-3.5" />
                Repository
              </a>
              <Link
                className="flex h-8 items-center gap-2.5 rounded-[0.5rem] px-2.5 text-xs text-muted hover:bg-soft hover:text-ink"
                href="/protocol#security"
              >
                <CircleHelp className="size-3.5" />
                Security model
              </Link>
            </nav>
            <div className="border-t border-line p-3">
              <div className="flex h-8 items-center gap-2.5 rounded-[0.5rem] px-2.5 text-xs text-muted">
                <Settings className="size-3.5" />
                Policy immutable
              </div>
            </div>
          </aside>

          <aside className="hidden border-r border-line bg-nav-secondary lg:block">
            {context}
          </aside>

          <div className="min-w-0 bg-app">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-app/90 px-3 backdrop-blur-xl sm:px-5">
              <div className="flex items-center gap-2 lg:hidden">
                <MobileNav />
                <Logo />
              </div>
              <div className="hidden items-center gap-2 lg:flex">
                <Badge className="border-success/20 bg-success/5 text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  {webEnv.defaultChainId === 31_337 ? "Hardhat" : "X Layer"} {networkLabel}
                </Badge>
                <span className="text-xs text-subtle">
                  Chain {webEnv.defaultChainId}
                </span>
              </div>
              <WalletButton />
            </header>
            <main className="min-h-[calc(100%-3.5rem)]">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
