import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { getProtocolSection } from "@/config/protocol-sections";
import { PolicySimulator } from "@/features/protocol/components/policy-simulator";
import { ProtocolSectionIcon } from "@/features/protocol/components/protocol-section-icon";
import Loading from "./loading";

const section = getProtocolSection("/protocol/policy");

export const metadata: Metadata = { title: "Policy simulator" };

export default function PolicyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="page-shell dashboard-grid pb-24 lg:pb-6">
        <PageHeader
          action={<Badge>Interactive</Badge>}
          description="Test allocation proposals against the exact deterministic bounds enforced before a rebalance can move funds."
          icon={section ? <ProtocolSectionIcon section={section} /> : undefined}
          title={section?.pageTitle ?? "Policy simulator"}
        />
        <PolicySimulator />
      </div>
    </Suspense>
  );
}
