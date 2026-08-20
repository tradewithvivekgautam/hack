import type { Metadata } from "next";
import { Suspense } from "react";
import { SecurityScreen } from "@/features/protocol/components/security-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Security model" };

export default function SecurityPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SecurityScreen />
    </Suspense>
  );
}
