import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Metric } from "@/components/ui/metric";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import {
  getProtocolSection,
  protocolChildSections,
} from "@/config/protocol-sections";
import {
  ProtocolSectionIcon,
  ProtocolTableLeadCell,
} from "./protocol-section-icon";

const overviewSection = getProtocolSection("/protocol");

export function ProtocolScreen() {
  if (!overviewSection) return null;

  return (
    <div className="page-shell dashboard-grid pb-24 lg:pb-6">
      <PageHeader
        icon={<ProtocolSectionIcon section={overviewSection} />}
        action={<Badge className="border-success/20 bg-success-soft text-success">
          <ShieldCheck className="size-3" />
          Fail closed
        </Badge>}
        description="A bounded allocation system: model interprets evidence while deterministic contracts retain custody and enforce every capital constraint."
        title={overviewSection.pageTitle}
      />
      <div className="dashboard-toolbar">
        <Typography className="text-muted" variant="ui">Deterministic controls and on-chain sources of truth</Typography>
        <Badge>{protocolChildSections.length} reference views</Badge>
      </div>
      <div className="dashboard-metric-strip">
        <Metric detail="immutable vault" label="Custody boundary" value="1" />
        <Metric detail="whitelisted" label="Strategies" value="3" />
        <Metric detail="enforced on-chain" label="Policy bounds" value="3" />
        <Metric detail="before submit" label="Validation stages" value="9" />
      </div>
      <Panel className="overflow-hidden" aria-labelledby="protocol-reference">
        <PanelHeader description="Separated routes for each protocol control surface." title="Protocol reference" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead className="hidden sm:table-cell">Summary</TableHead>
              <TableHead className="w-10"><span className="sr-only">Open</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {protocolChildSections.map((section) => (
                <TableRow key={section.href}>
                  <TableCell>
                    <Link className="block" href={section.href}>
                      <ProtocolTableLeadCell section={section} />
                    </Link>
                  </TableCell>
                  <TableCell className="hidden max-w-[28rem] whitespace-normal text-muted sm:table-cell">
                    {section.summary}
                  </TableCell>
                  <TableCell>
                    <Link
                      aria-label={`Open ${section.label}`}
                      className="inline-flex text-muted transition-transform duration-150 hover:text-ink active:scale-[0.97]"
                      href={section.href}
                    >
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
      <Panel className="p-3">
        <Typography className="text-ink-muted" variant="label">Core invariant</Typography>
        <Typography className="mt-1.5 text-ink" variant="title">
          The LLM proposes. The contract disposes.
        </Typography>
        <Typography className="mt-0.5 text-muted" variant="body">
          Model compromise cannot change strategies, custody assets, bypass
          policy limits, or select arbitrary withdrawal receiver.
        </Typography>
      </Panel>
    </div>
  );
}
