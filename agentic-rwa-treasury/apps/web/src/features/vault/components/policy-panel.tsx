import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  DescriptionDetails,
  DescriptionListSection,
  DescriptionTerm,
} from "@/components/description-list";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Typography, typographyVariants } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

const rules = [
  { label: "Strategy concentration", value: "≤ 60%" },
  { label: "One-way turnover", value: "≤ 20%" },
  { label: "Rebalance cooldown", value: "1 hour" },
  { label: "Weight sum", value: "10,000 bps" },
  { label: "Strategy set", value: "Fixed (3 adapters)" },
] as const;

export function PolicyPanel() {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader title="Contract policy" />
      <div className="px-4 pb-1 pt-3">
        <DescriptionListSection title="Summary">
          {rules.flatMap(({ label, value }) => [
            <DescriptionTerm key={`${label}-term`}>{label}</DescriptionTerm>,
            <DescriptionDetails key={`${label}-value`}>{value}</DescriptionDetails>,
          ])}
        </DescriptionListSection>
        <Typography className="mt-3 text-subtle" variant="caption">
          Hard limits evaluated on-chain before any capital moves.
        </Typography>
      </div>
      <Link
        className={cn(
          typographyVariants.caption,
          "flex h-10 items-center gap-2 border-t border-line/45 px-4 font-medium text-accent transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-accent-soft active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
        )}
        href="/protocol/policy"
      >
        <CheckCircle2 className="size-3.5" />
        Test a malicious allocation
        <ArrowRight className="ml-auto size-3.5" />
      </Link>
    </Panel>
  );
}
