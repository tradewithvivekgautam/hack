"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { WalletGate } from "./wallet-gate";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return children;
  return (
    <WalletGate>
      <AppShell>{children}</AppShell>
    </WalletGate>
  );
}
