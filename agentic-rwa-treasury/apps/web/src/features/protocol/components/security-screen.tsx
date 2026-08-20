import { CheckCircle2, FileKey2, LockKeyhole, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { getProtocolSection } from "@/config/protocol-sections";
import { ProtocolSectionIcon } from "./protocol-section-icon";

const section = getProtocolSection("/protocol/security");

const claims = ["Agent key cannot withdraw to itself or choose a receiver.", "Model never emits contract addresses; semantic strategy IDs map to immutable adapters.", "Policy validation runs before adapter movement and whole rebalance is atomic.", "A compromised agent can only choose suboptimal allocation inside hard policy bounds.", "Browser verification proves displayed memo integrity, not remote-model provenance.", "Pause and emergency exit authority remains separate from AGENT_ROLE."] as const;

export function SecurityScreen() {
  const may = ["Read approved documents", "Propose three weights", "Explain evidence and risks", "Submit a policy-bounded rebalance"] as const;
  const never = ["Touch funds directly", "Register a strategy", "Bypass policy or cooldown", "Withdraw to an arbitrary receiver"] as const;

  return (
    <div className="page-shell dashboard-grid pb-24 lg:pb-6">
      <PageHeader icon={section ? <ProtocolSectionIcon section={section} /> : undefined} description="System assumes model and agent compromise from first design decision." title={section?.pageTitle ?? "Security model"} />
      <Panel className="overflow-hidden">
        <PanelHeader action={<FileKey2 aria-hidden="true" className="size-4 text-accent" strokeWidth={1.5} />} description="Permissions remain intentionally narrower than model capability." title="Authority boundaries" />
        <div className="grid md:grid-cols-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={2}>Agent may</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {may.map((item) => (
                <TableRow key={item}>
                  <TableCell className="w-8">
                    <CheckCircle2 aria-hidden="true" className="size-3.5 text-success" strokeWidth={1.5} />
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted">{item}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Table className="md:border-l md:border-line">
            <TableHeader>
              <TableRow>
                <TableHead colSpan={2}>Agent can never</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {never.map((item) => (
                <TableRow key={item}>
                  <TableCell className="w-8">
                    <LockKeyhole aria-hidden="true" className="size-3.5 text-danger" strokeWidth={1.5} />
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted">{item}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
      <section>
        <Typography as="h2" className="text-ink-muted" variant="label">Bounded compromise</Typography>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {claims.map((claim) => <Panel className="flex gap-2.5 p-3" key={claim}><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={1.5} /><Typography className="text-muted" variant="body">{claim}</Typography></Panel>)}
        </div>
      </section>
    </div>
  );
}
