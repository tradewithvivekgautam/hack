import type { Metadata } from "next";
import { Suspense } from "react";
import { ProtocolScreen } from "@/features/protocol/components/protocol-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Protocol" };

export default function ProtocolPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProtocolScreen />
    </Suspense>
  );
}
