import type { Metadata } from "next";
import { Suspense } from "react";
import { VaultScreen } from "@/features/vault/components/vault-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Vault" };

export default function VaultPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VaultScreen />
    </Suspense>
  );
}
