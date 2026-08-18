import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/panel";

const rules = [
  { icon: ShieldCheck, label: "Strategy concentration", value: "≤ 60%" },
  { icon: ArrowRight, label: "One-way turnover", value: "≤ 20%" },
  { icon: Clock3, label: "Rebalance cooldown", value: "1 hour" },
] as const;

export function PolicyPanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader title="Contract policy" description="Hard limits evaluated before any capital moves." />
      <div className="divide-y divide-line">
        {rules.map(({ icon: Icon, label, value }) => (
          <div className="flex h-11 items-center gap-2.5 px-4" key={label}>
            <Icon className="size-3.5 text-success" />
            <span className="flex-1 text-xs text-muted">{label}</span>
            <span className="text-xs font-semibold text-ink number-tabular">{value}</span>
          </div>
        ))}
      </div>
      <Link className="flex h-10 items-center gap-2 border-t border-line px-4 text-xs font-medium text-accent hover:bg-accent-soft" href="/protocol#policy-simulator">
        <CheckCircle2 className="size-3.5" />
        Test a malicious allocation
        <ArrowRight className="ml-auto size-3.5" />
      </Link>
    </Panel>
  );
}
