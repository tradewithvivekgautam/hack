import type { Metadata } from "next";
import { Suspense } from "react";
import { PipelineScreen } from "@/features/protocol/components/pipeline-screen";
import Loading from "./loading";

export const metadata: Metadata = { title: "Agent pipeline" };

export default function PipelinePage() {
  return (
    <Suspense fallback={<Loading />}>
      <PipelineScreen />
    </Suspense>
  );
}
