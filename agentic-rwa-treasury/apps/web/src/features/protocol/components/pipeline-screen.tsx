import { Activity, Bot } from "lucide-react";
import type { CSSProperties } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Typography } from "@/components/ui/typography";
import { getProtocolSection } from "@/config/protocol-sections";
import { ProtocolSectionIcon } from "./protocol-section-icon";

const section = getProtocolSection("/protocol/pipeline");

const steps = [
  "Gather and hash approved documents",
  "Request strict allocation tool output",
  "Validate schema and evidence references",
  "Run exact local policy pre-check",
  "Canonicalize and hash the decision memo",
  "Preflight the live contract before pinning",
  "Pin and read back exact JSON bytes",
  "Simulate the exact real CID and submit",
  "Write optional diagnostics",
] as const;

export function PipelineScreen() {
  return (
    <div className="page-shell dashboard-grid pb-24 lg:pb-6">
      <PageHeader icon={section ? <ProtocolSectionIcon section={section} /> : undefined} description="Each stage narrows uncertainty before a transaction can be submitted." title={section?.pageTitle ?? "Agent pipeline"} />
      <Panel className="overflow-hidden">
        <PanelHeader
          action={<Bot aria-hidden="true" className="size-4 text-accent" strokeWidth={1.5} />}
          description="One ordered workflow; no hidden path bypasses policy or exact-byte verification."
          title="Epoch sequence"
        />
        <ol className="timeline px-4 py-3">
          {steps.map((step, index) => (
            <li
              className="timeline-item"
              key={step}
              style={{ "--timeline-delay": `${index * 60}ms` } as CSSProperties}
            >
              <span className="timeline-marker" aria-hidden="true">
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span className="timeline-line" aria-hidden="true" />
              ) : null}
              <Typography as="span" className="text-muted" variant="ui">{step}</Typography>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel className="flex gap-3 p-4">
        <Activity aria-hidden="true" className="size-4 shrink-0 text-success" strokeWidth={1.5} />
        <Typography className="text-muted" variant="body">
          A transaction is attempted only after policy, canonicalization,
          pin/read-back, and exact simulation succeed.
        </Typography>
      </Panel>
    </div>
  );
}
