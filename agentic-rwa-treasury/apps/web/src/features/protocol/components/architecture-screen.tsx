import {
  Bot,
  Braces,
  Database,
  Fingerprint,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { getProtocolSection } from "@/config/protocol-sections";
import { ProtocolSectionIcon } from "./protocol-section-icon";

const section = getProtocolSection("/protocol/architecture");

const architecture = [
  { icon: Bot, title: "DeepSeek allocator", text: "Reads bounded source documents and emits one schema-validated allocation proposal with cited evidence." },
  { icon: Braces, title: "TypeScript preflight", text: "Validates shape, evidence IDs, policy, canonical bytes, live preflight, IPFS read-back, and exact viem simulation." },
  { icon: ShieldCheck, title: "Allocation policy", text: "Enforces fixed strategies, exact weight sum, 60% concentration, 20% turnover, and one-hour cooldown." },
  { icon: WalletCards, title: "ERC-4626 vault", text: "Holds custody, accounts for rtUSD shares, sources withdrawal liquidity, and performs atomic two-phase rebalances." },
  { icon: Fingerprint, title: "Reasoning registry", text: "Records exact memo hash, CID, weights, agent, timestamp, and total assets for every successful epoch." },
  { icon: Database, title: "IPFS corpus", text: "Stores canonical decision bytes. SQLite remains optional diagnostics and never becomes protocol truth." },
] as const;

export function ArchitectureScreen() {
  return (
    <div className="page-shell dashboard-grid pb-24 lg:pb-6">
      <PageHeader icon={section ? <ProtocolSectionIcon section={section} /> : undefined} description="Clear boundaries separate model judgment from capital movement." title={section?.pageTitle ?? "Architecture"} />
      <section className="grid gap-3 md:grid-cols-2">
        <h2 className="sr-only">Architecture components</h2>
        {architecture.map(({ icon: Icon, title, text }, index) => (
          <Card key={title}>
            <CardContent className="grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-7 place-items-center rounded-[0.5rem] bg-soft text-muted">
                  <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
                </span>
                <Typography as="span" className="text-subtle" variant="caption">0{index + 1}</Typography>
              </div>
              <div className="grid gap-0.5">
                <Typography as="h3" className="text-ink" variant="title">{title}</Typography>
                <Typography className="text-subtle" variant="body">{text}</Typography>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
