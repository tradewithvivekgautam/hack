import Link from "next/link";
import { Bot, Braces, Database, FileKey2, ShieldCheck, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sections = [
  ["#architecture", "Architecture", Braces],
  ["#policy-simulator", "Policy simulator", ShieldCheck],
  ["#security", "Security model", FileKey2],
  ["#contracts", "Contracts", WalletCards],
  ["#agent", "Agent pipeline", Bot],
  ["#persistence", "Persistence", Database],
] as const;

export function ProtocolContextRail() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b border-line px-4"><span className="text-[0.8125rem] font-semibold text-ink">Protocol map</span><Badge>v1.0</Badge></div>
      <nav className="flex-1 p-3">
        <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.08em] text-subtle">Sections</div>
        <div className="grid gap-1">
          {sections.map(([href, label, Icon]) => <Link className="flex h-9 items-center gap-2.5 rounded-[0.5rem] px-2 text-xs text-muted hover:bg-soft hover:text-ink" href={`/protocol${href}`} key={href}><Icon className="size-3.5" />{label}</Link>)}
        </div>
        <div className="mt-4 rounded-[0.875rem] border border-line bg-surface p-3">
          <p className="text-xs font-semibold text-ink">Core invariant</p>
          <p className="mt-2 text-[0.8125rem] font-semibold tracking-[-0.02em] text-accent-strong">The LLM proposes.<br />The contract disposes.</p>
          <p className="mt-2 text-xs leading-4 text-subtle">Model compromise cannot change the strategy set, custody assets, bypass limits, or choose an arbitrary receiver.</p>
        </div>
      </nav>
    </div>
  );
}
