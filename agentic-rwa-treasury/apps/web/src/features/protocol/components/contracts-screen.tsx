import { Bot, FileKey2, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import {
  DescriptionDetails,
  DescriptionListSection,
  DescriptionTerm,
} from "@/components/description-list";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelContent, PanelHeader } from "@/components/ui/panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableLeadCell, TablePill } from "@/components/ui/table-cells";
import { Typography } from "@/components/ui/typography";
import { webEnv } from "@/config/env";
import { getProtocolSection } from "@/config/protocol-sections";
import { formatAddress } from "@/lib/format";
import { ProtocolSectionIcon } from "./protocol-section-icon";

const section = getProtocolSection("/protocol/contracts");

const truths = [
  ["Funds and share accounting", "RwaTreasuryVault"],
  ["Risk constraints", "AllocationPolicy"],
  ["Decision history", "ReasoningRegistry events + storage"],
  ["Decision memo", "Canonical IPFS bytes"],
  ["Agent operations", "Ephemeral process logs"],
  ["Diagnostics", "Optional SQLite, non-authoritative"],
] as const;

export function ContractsScreen() {
  const addresses = [
    ["Vault", webEnv.contracts.vault],
    ["Asset", webEnv.contracts.asset],
    ["Policy", webEnv.contracts.policy],
    ["Registry", webEnv.contracts.registry],
    ["RWA adapter", webEnv.contracts.rwaAdapter],
    ["Lending adapter", webEnv.contracts.lendingAdapter],
    ["Idle adapter", webEnv.contracts.idleAdapter],
  ] as const;

  return (
    <div className="page-shell dashboard-grid pb-24 lg:pb-6">
      <PageHeader
        icon={section ? <ProtocolSectionIcon section={section} /> : undefined}
        description="Deployments identify custody and policy authority; records identify what was decided and why."
        title={section?.pageTitle ?? "Contracts and records"}
      />
      <Panel className="overflow-hidden">
        <PanelHeader
          action={<Badge>Chain {webEnv.defaultChainId}</Badge>}
          description="Zero addresses indicate demo mode or an unsynchronized deployment."
          title="Contract deployment"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Deployment address</TableHead>
              <TableHead className="hidden sm:table-cell">Short address</TableHead>
              <TableHead className="w-10"><span className="sr-only">Copy</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {addresses.map(([label, address]) => (
            <TableRow key={label}>
              <TableCell>
                <TableLeadCell seed={label} title={label} />
              </TableCell>
              <TableCell className="max-w-[16rem] lg:max-w-[24rem]">
                <TablePill className="font-mono text-ink">{address}</TablePill>
              </TableCell>
              <TableCell className="hidden text-subtle sm:table-cell">
                {formatAddress(address)}
              </TableCell>
              <TableCell><CopyButton value={address} /></TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </Panel>
      <Panel className="overflow-hidden">
        <PanelHeader
          action={
            <FileKey2
              aria-hidden="true"
              className="size-4 text-success"
              strokeWidth={1.5}
            />
          }
          title="Sources of truth"
        />
        <PanelContent className="px-4 pb-3 pt-3">
          <DescriptionListSection title="Sources of truth">
            {truths.flatMap(([label, value]) => [
              <DescriptionTerm key={`${label}-term`}>{label}</DescriptionTerm>,
              <DescriptionDetails
                className="[font-variant-numeric:normal]"
                key={`${label}-value`}
              >
                {value}
              </DescriptionDetails>,
            ])}
          </DescriptionListSection>
        </PanelContent>
      </Panel>
      <Panel className="flex gap-3 p-4">
        <WalletCards
          aria-hidden="true"
          className="size-4 shrink-0 text-accent"
          strokeWidth={1.5}
        />
        <Typography className="text-muted" variant="body">
          <Bot
            aria-hidden="true"
            className="mr-1 inline size-3.5 text-subtle"
            strokeWidth={1.5}
          />
          Agent diagnostics remain operational data only; custody and policy
          truth never depends on them.
        </Typography>
      </Panel>
    </div>
  );
}
