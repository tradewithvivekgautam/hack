"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useEffectiveAccount } from "@/lib/use-effective-account";

export function WalletGate({ children }: { children: ReactNode }) {
  const account = useEffectiveAccount();
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated || account.connected) return;
    const query = window.location.search.slice(1);
    const currentPath = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
  }, [account.connected, hydrated, pathname, router]);

  return (
    <>
      {children}
      {!hydrated || !account.connected ? <AuthLoading /> : null}
    </>
  );
}
