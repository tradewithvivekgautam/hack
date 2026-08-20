"use client";

import { CircleHelp, Code2, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Typography } from "@/components/ui/typography";
import { WalletButton } from "@/components/wallet/wallet-button";
import { webEnv } from "@/config/env";
import { primaryNavigation, isPrimaryNavActive } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ContextRail } from "./context-rail";

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [contextOpen, setContextOpen] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const railTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "tween" as const, duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };
  const iconTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.3, bounce: 0 };
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
    <div className="min-h-dvh bg-canvas lg:h-dvh lg:p-2">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="min-h-dvh bg-canvas lg:flex lg:h-full lg:min-h-0 lg:overflow-hidden" id="app-root">
        <aside className="hidden bg-nav lg:flex lg:min-h-0 lg:w-[3rem] lg:shrink-0 lg:flex-col">
          <div className="flex h-12 shrink-0 items-center justify-center">
            <Logo compact />
          </div>
          <nav aria-label="Primary navigation" className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-[0.375rem]">
            <div className="grid gap-1">
              {primaryNavigation.map(({ href, label, icon: Icon }) => {
                const active = isPrimaryNavActive(pathname, href);
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    aria-label={label}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-[0.5625rem] transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97]",
                      active
                        ? "bg-surface text-ink shadow-[var(--shadow-surface)] ring-1 ring-line"
                        : "text-muted hover:bg-surface-hover hover:text-ink",
                    )}
                    href={href}
                    key={href}
                    title={label}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={active ? 2 : 1.75}
                    />
                    <span className="sr-only">{label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="my-3 h-px bg-line" />
            <a
              aria-label="Repository"
              className="flex size-9 items-center justify-center rounded-[0.5625rem] text-muted transition-[background-color,color,transform] duration-150 hover:bg-surface-hover hover:text-ink active:scale-[0.97]"
              href={repositoryUrl}
              {...repositoryLinkProps}
            >
              <Code2 aria-hidden="true" className="size-4" />
            </a>
            <Link
              aria-label="Security model"
              className="flex size-9 items-center justify-center rounded-[0.5625rem] text-muted transition-[background-color,color,transform] duration-150 hover:bg-surface-hover hover:text-ink active:scale-[0.97]"
              href="/protocol/security"
            >
              <CircleHelp aria-hidden="true" className="size-4" />
            </Link>
          </nav>
          <div className="border-t border-line p-1.5">
            <div aria-label="Policy immutable" className="flex size-9 items-center justify-center text-muted" title="Policy immutable">
              <Settings aria-hidden="true" className="size-4" />
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-app lg:flex lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:rounded-[0.875rem] lg:border lg:border-line lg:shadow-[var(--shadow-frame)]">
        <motion.aside
          animate={{ width: contextOpen ? "16rem" : "0rem" }}
          aria-hidden={!contextOpen}
          aria-label="Page context"
          className={cn("hidden min-h-0 shrink-0 overflow-hidden bg-nav-secondary lg:block", contextOpen ? "border-r border-line" : "border-r-0 border-transparent")}
          id="context-rail"
          inert={!contextOpen}
          initial={false}
          transition={railTransition}
        >
          <motion.div
            animate={{
              opacity: contextOpen ? 1 : 0,
              filter: contextOpen ? "blur(0rem)" : "blur(0.25rem)",
              transform: shouldReduceMotion || contextOpen ? "translateX(0rem)" : "translateX(-0.5rem)",
            }}
            className="h-full w-[16rem]"
            initial={false}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: contextOpen ? 0.22 : 0.12, delay: contextOpen ? 0.06 : 0, ease: [0.23, 1, 0.32, 1] }}
          >
            <ContextRail />
          </motion.div>
        </motion.aside>

        <div className="min-w-0 bg-app lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-app/90 px-3 backdrop-blur-xl sm:px-4">
            <div className="flex items-center gap-2 lg:hidden">
              <MobileNav />
              <Logo />
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <IconButton aria-controls="context-rail" aria-expanded={contextOpen} aria-label={contextOpen ? "Close page context" : "Open page context"} className="relative size-8 overflow-hidden" onClick={() => setContextOpen((open) => !open)} title={contextOpen ? "Close page context" : "Open page context"}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0rem)" }}
                    className="absolute inset-0 grid place-items-center"
                    exit={{ opacity: 0, transform: "scale(0.92)", filter: "blur(0.125rem)" }}
                    initial={{ opacity: 0, transform: "scale(0.92)", filter: "blur(0.125rem)" }}
                    key={contextOpen ? "close" : "open"}
                    transition={iconTransition}
                  >
                    {contextOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                  </motion.span>
                </AnimatePresence>
              </IconButton>
              <Badge className="border-success/20 bg-success/5 text-success">
                <span className="size-1.5 rounded-full bg-success" />
                {webEnv.defaultChainId === 31_337 ? "Hardhat" : "X Layer"}{" "}
                {networkLabel}
              </Badge>
              <Typography as="span" className="text-subtle" variant="caption">
                Chain {webEnv.defaultChainId}
              </Typography>
            </div>
            <WalletButton />
          </header>
          <main className="min-h-0 min-w-0 overflow-x-clip overscroll-contain lg:flex-1 lg:overflow-y-auto lg:[scrollbar-gutter:stable]" id="main-content" tabIndex={-1}>{children}</main>
        </div>
        </div>
      </div>
    </div>
  );
}
