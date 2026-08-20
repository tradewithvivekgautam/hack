import { CheckCircle2, FileKey2, ScrollText } from "lucide-react";
import type { CSSProperties } from "react";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Typography } from "@/components/ui/typography";
import { formatUtcDateTime } from "@/lib/format";
import type { DecisionRecord } from "../model/types";

export function DecisionActivityTimeline({ decision }: { decision: DecisionRecord }) {
  const items = [
    { icon: ScrollText, label: "Decision submitted", detail: formatUtcDateTime(decision.timestamp) },
    { icon: CheckCircle2, label: "Policy bounds verified", detail: "Recorded before funds can move" },
    { icon: FileKey2, label: "Canonical memo linked", detail: "IPFS CID committed to registry" },
  ];

  return <Panel className="overflow-hidden"><PanelHeader title="Recorded activity" description="Sequence retained with the decision record." /><ol className="timeline px-4 py-3">{items.map(({ icon: Icon, label, detail }, index) => <li className="timeline-item" key={label} style={{ "--timeline-delay": `${index * 60}ms` } as CSSProperties}><span className="timeline-marker" aria-hidden="true"><Icon className="size-3" /></span>{index < items.length - 1 ? <span className="timeline-line" aria-hidden="true" /> : null}<span className="min-w-0"><Typography as="span" className="block font-medium text-ink" variant="ui">{label}</Typography><Typography as="span" className="mt-0.5 block text-subtle" variant="caption">{detail}</Typography></span></li>)}</ol></Panel>;
}
