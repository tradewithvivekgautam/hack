import Link from "next/link";
import { ArrowRight, FileKey2, Fingerprint, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Typography, typographyVariants } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";

export function IntegrityPanel({
  lastRebalanceAt,
}: {
  lastRebalanceAt: number;
}) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        action={
          <Badge className="border-accent/20 bg-accent-soft text-accent-strong">
            <Link2 className="size-3" />
            Committed
          </Badge>
        }
        description="Every completed rebalance stores a CID and exact-byte hash on X Layer."
        title="Reasoning integrity"
      />
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-[0.75rem] border border-line bg-soft p-3">
          <Typography as="div" className="flex items-center gap-2 text-subtle" variant="caption">
            <FileKey2 className="size-3.5" />
            Latest commitment
          </Typography>
          <Typography as="div" className="mt-2 text-ink" variant="title">
            Registry hash + CID
          </Typography>
          <Typography as="div" className="mt-0.5 text-subtle" variant="caption">
            {formatRelativeDate(lastRebalanceAt * 1_000)}
          </Typography>
        </div>
        <div className="rounded-[0.75rem] border border-line bg-soft p-3">
          <Typography as="div" className="flex items-center gap-2 text-subtle" variant="caption">
            <Fingerprint className="size-3.5" />
            Verification
          </Typography>
          <Typography as="div" className="mt-2 text-accent-strong" variant="title">
            User initiated
          </Typography>
          <Typography as="div" className="mt-0.5 text-subtle" variant="caption">
            Browser → IPFS → X Layer
          </Typography>
        </div>
      </div>
      <Link
        className={cn(typographyVariants.caption, "flex h-10 items-center gap-2 border-t border-line px-4 font-medium text-accent hover:bg-accent-soft")}
        href="/decisions"
      >
        Verify a committed decision
        <ArrowRight className="ml-auto size-3.5" />
      </Link>
    </Panel>
  );
}
