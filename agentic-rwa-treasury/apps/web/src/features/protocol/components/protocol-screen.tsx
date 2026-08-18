import { Activity, Bot, Braces, CheckCircle2, Database, FileKey2, Fingerprint, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { webEnv } from "@/config/env";
import { formatAddress } from "@/lib/format";
import { PolicySimulator } from "./policy-simulator";
import { ProtocolContextRail } from "./protocol-context-rail";

const architecture = [
  { icon: Bot, title: "DeepSeek allocator", text: "Reads bounded source documents and emits one schema-validated allocation proposal with cited evidence." },
  { icon: Braces, title: "TypeScript preflight", text: "Validates shape, evidence IDs, policy, canonical bytes, live preflight, IPFS read-back, and exact viem simulation before submission." },
  { icon: ShieldCheck, title: "Allocation policy", text: "Enforces fixed strategies, exact weight sum, 60% concentration, 20% turnover, and one-hour cooldown." },
  { icon: WalletCards, title: "ERC-4626 vault", text: "Holds custody, accounts for rtUSD shares, sources withdrawal liquidity, and performs atomic two-phase rebalances." },
  { icon: Fingerprint, title: "Reasoning registry", text: "Records the exact memo hash, CID, weights, agent, timestamp, and total assets for every successful epoch." },
  { icon: Database, title: "IPFS corpus", text: "Stores canonical decision bytes. SQLite remains optional diagnostics and never becomes protocol truth." },
] as const;

const securityClaims = [
  "The agent key cannot withdraw to itself or choose a receiver.",
  "The model never emits contract addresses; semantic strategy IDs map to immutable adapters.",
  "Policy validation runs before any adapter movement and the entire rebalance is atomic.",
  "A compromised agent can only choose a suboptimal allocation inside hard policy bounds.",
  "Browser verification proves integrity of the displayed memo, not remote-model provenance.",
  "Pause and emergency exit authority remains separate from AGENT_ROLE.",
] as const;

export function ProtocolScreen() {
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
    <AppShell context={<ProtocolContextRail />}>
      <div className="page-shell pb-24 lg:pb-6">
        <div>
          <div className="flex items-center gap-2"><h1 className="page-heading">Protocol</h1><Badge className="border-success/20 bg-success-soft text-success"><LockKeyhole className="size-3" />Fail closed</Badge></div>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-subtle">A deliberately small trust-minimized system: the model interprets prose, while deterministic contracts retain custody and enforce every capital constraint.</p>
        </div>

        <section className="mt-4" id="architecture">
          <div className="section-label">End-to-end architecture</div>
          <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {architecture.map(({ icon: Icon, title, text }, index) => <Panel className="p-4" key={title}><div className="flex items-center justify-between"><span className="grid size-8 place-items-center rounded-[0.625rem] border border-line bg-soft text-muted"><Icon className="size-4" /></span><span className="text-xs font-semibold text-subtle">0{index + 1}</span></div><h2 className="mt-3 text-[0.8125rem] font-semibold text-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-subtle">{text}</p></Panel>)}
          </div>
        </section>

        <div className="mt-4"><PolicySimulator /></div>

        <section className="mt-4" id="security">
          <Panel className="overflow-hidden">
            <PanelHeader action={<FileKey2 className="size-4 text-accent" />} description="The agent is treated as compromiseable from the first line of design." title="Security model" />
            <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-4"><div className="section-label">Agent may</div><div className="mt-3 grid gap-2">{["Read approved documents", "Propose three weights", "Explain evidence and risks", "Submit a policy-bounded rebalance"].map((item) => <div className="flex items-center gap-2 text-xs text-muted" key={item}><CheckCircle2 className="size-3.5 text-success" />{item}</div>)}</div></div>
              <div className="p-4"><div className="section-label">Agent can never</div><div className="mt-3 grid gap-2">{["Touch funds directly", "Register a strategy", "Bypass policy or cooldown", "Withdraw to an arbitrary receiver"].map((item) => <div className="flex items-center gap-2 text-xs text-muted" key={item}><LockKeyhole className="size-3.5 text-danger" />{item}</div>)}</div></div>
            </div>
            <div className="grid border-t border-line md:grid-cols-2 xl:grid-cols-3">{securityClaims.map((claim) => <div className="flex gap-2 border-b border-line p-3 text-xs leading-5 text-muted md:border-r" key={claim}><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" />{claim}</div>)}</div>
          </Panel>
        </section>

        <section className="mt-4" id="contracts">
          <Panel className="overflow-hidden">
            <PanelHeader action={<Badge>Chain {webEnv.defaultChainId}</Badge>} description="Zero addresses indicate demo mode or a deployment that has not been synchronized yet." title="Contract deployment" />
            <div className="divide-y divide-line">{addresses.map(([label, address]) => <div className="flex min-h-10 items-center gap-3 px-4 py-2" key={label}><span className="w-24 shrink-0 text-xs text-subtle">{label}</span><code className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{address}</code><span className="hidden text-xs text-subtle sm:block">{formatAddress(address)}</span><CopyButton value={address} /></div>)}</div>
          </Panel>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-2" id="agent">
          <Panel className="overflow-hidden">
            <PanelHeader action={<Bot className="size-4 text-accent" />} title="Agent epoch pipeline" />
            <ol className="divide-y divide-line">{["Gather and hash approved documents", "Request strict allocation tool output", "Validate schema and evidence references", "Run exact local policy pre-check", "Canonicalize and hash the decision memo", "Preflight the live contract before pinning", "Pin and read back exact JSON bytes", "Simulate the exact real CID and submit", "Write optional diagnostics"].map((step, index) => <li className="flex min-h-10 items-center gap-3 px-4 py-2 text-xs text-muted" key={step}><span className="grid size-5 shrink-0 place-items-center rounded-full bg-soft text-xs font-semibold text-subtle">{index + 1}</span>{step}</li>)}</ol>
          </Panel>
          <Panel className="overflow-hidden" id="persistence">
            <PanelHeader action={<Activity className="size-4 text-success" />} title="Sources of truth" />
            <div className="divide-y divide-line">{[
              ["Funds and share accounting", "RwaTreasuryVault"],
              ["Risk constraints", "AllocationPolicy"],
              ["Decision history", "ReasoningRegistry events + storage"],
              ["Decision memo", "Canonical IPFS bytes"],
              ["Agent operations", "Ephemeral process logs"],
              ["Diagnostics", "Optional SQLite, non-authoritative"],
            ].map(([label, value]) => <div className="flex min-h-10 items-center gap-3 px-4 py-2" key={label}><span className="flex-1 text-xs text-muted">{label}</span><span className="text-xs font-medium text-ink">{value}</span></div>)}</div>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}
