import type { Metadata } from "next";
import { Suspense } from "react";
import { DecisionsScreen } from "@/features/decisions/components/decisions-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Decision log" };

export default function DecisionsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DecisionsScreen />
    </Suspense>
  );
}
