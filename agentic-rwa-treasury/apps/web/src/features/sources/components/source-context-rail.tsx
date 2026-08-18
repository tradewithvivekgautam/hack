import { CheckCircle2, Clock3, DatabaseZap, FileKey2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SourceStatus } from "../model/types";

export function SourceContextRail({ sources }: { sources: readonly SourceStatus[] }) {
  const fresh = sources.filter((source) => !source.stale).length;
  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b border-line px-4"><span className="text-[0.8125rem] font-semibold text-ink">Corpus status</span><Badge>{sources.length} sources</Badge></div>
      <div className="flex-1 p-3">
        <div className="rounded-[0.875rem] border border-line bg-surface p-3">
          <div className="flex items-center gap-2 text-xs text-subtle"><DatabaseZap className="size-3.5" />Latest collection</div>
          <div className="mt-2 text-[1rem] font-semibold text-ink">{fresh}/{sources.length} fresh</div>
          <p className="mt-1 text-xs leading-4 text-subtle">Stale data is never hidden. It remains available with an explicit risk flag and content hash.</p>
        </div>
        <div className="mt-4 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-subtle">Pipeline guarantees</div>
        <div className="mt-1 grid gap-1">
          {[
            [FileKey2, "Exact content hashing"],
            [Clock3, "Bounded timeout and retry"],
            [CheckCircle2, "Schema-validated metadata"],
            [ShieldCheck, "Last-known-good fallback"],
          ].map(([Icon, label]) => <div className="flex h-9 items-center gap-2 rounded-[0.5rem] px-2 text-xs text-muted" key={label as string}><Icon className="size-3.5 text-success" /><span>{label as string}</span></div>)}
        </div>
      </div>
    </div>
  );
}
