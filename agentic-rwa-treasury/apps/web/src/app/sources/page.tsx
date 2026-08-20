import type { Metadata } from "next";
import { Suspense } from "react";
import { SourcesScreen } from "@/features/sources/components/sources-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Data sources" };

export default function SourcesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SourcesScreen />
    </Suspense>
  );
}
