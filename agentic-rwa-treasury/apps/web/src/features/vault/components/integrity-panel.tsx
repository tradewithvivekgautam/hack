import Link from "next/link";
import { ArrowRight, FileKey2, Fingerprint, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader } from "@/components/ui/panel";
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
          <div className="flex items-center gap-2 text-xs text-subtle">
            <FileKey2 className="size-3.5" />
            Latest commitment
          </div>
          <div className="mt-2 text-[0.875rem] font-semibold text-ink">
            Registry hash + CID
          </div>
          <div className="mt-0.5 text-xs text-subtle">
            {formatRelativeDate(lastRebalanceAt * 1_000)}
          </div>
        </div>
        <div className="rounded-[0.75rem] border border-line bg-soft p-3">
          <div className="flex items-center gap-2 text-xs text-subtle">
            <Fingerprint className="size-3.5" />
            Verification
          </div>
          <div className="mt-2 text-[0.875rem] font-semibold text-accent-strong">
            User initiated
          </div>
          <div className="mt-0.5 text-xs text-subtle">
            Browser → IPFS → X Layer
          </div>
        </div>
      </div>
      <Link
        className="flex h-10 items-center gap-2 border-t border-line px-4 text-xs font-medium text-accent hover:bg-accent-soft"
        href="/decisions"
      >
        Verify a committed decision
        <ArrowRight className="ml-auto size-3.5" />
      </Link>
    </Panel>
  );
}
