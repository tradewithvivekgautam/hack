import type { Metadata } from "next";
import { Suspense } from "react";
import { ArchitectureScreen } from "@/features/protocol/components/architecture-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Protocol architecture" };

export default function ArchitecturePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ArchitectureScreen />
    </Suspense>
  );
}
