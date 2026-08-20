import type { Metadata } from "next";
import { Suspense } from "react";
import { ContractsScreen } from "@/features/protocol/components/contracts-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Contracts and records" };

export default function ContractsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ContractsScreen />
    </Suspense>
  );
}
