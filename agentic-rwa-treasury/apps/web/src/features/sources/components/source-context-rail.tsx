import { CheckCircle2, Clock3, DatabaseZap, FileKey2, ShieldCheck, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconTile, type IconTone } from "@/components/ui/icon-tile";
import type { SourceStatus } from "../model/types";

export function SourceContextRail({ sources }: { sources: readonly SourceStatus[] }) {
  const fresh = sources.filter((source) => !source.stale).length;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 items-center justify-between px-3"><span className="type-title text-ink">Corpus status</span><Badge>{sources.length} sources</Badge></div>
      <div className="flex-1 p-3">
        <div className="rounded-[0.875rem] border border-line bg-surface p-3">
          <div className="flex items-center gap-2 type-caption text-subtle"><DatabaseZap className="size-3.5" />Latest collection</div>
          <div className="mt-2 text-[1rem] font-semibold text-ink">{fresh}/{sources.length} fresh</div>
          <p className="mt-1 type-caption text-subtle">Stale data is never hidden. It remains available with an explicit risk flag and content hash.</p>
        </div>
        <div className="mt-4 px-2 type-caption font-semibold uppercase tracking-[0.08em] text-subtle">Pipeline guarantees</div>
        <div className="mt-1 grid gap-1">
          {([
            [FileKey2, "Exact content hashing"],
            [Clock3, "Bounded timeout and retry"],
            [CheckCircle2, "Schema-validated metadata"],
            [ShieldCheck, "Last-known-good fallback"],
          ] as const satisfies readonly (readonly [LucideIcon, string])[]).map(([Icon, label], index) => <div className="flex h-9 items-center gap-2 rounded-[0.5rem] px-2 type-ui text-muted" key={label}><IconTile className="size-6 rounded-[0.4375rem]" tone={(index % 2 === 0 ? "green" : "blue") as IconTone}><Icon className="size-3.5" strokeWidth={1.6} /></IconTile><span>{label}</span></div>)}
        </div>
      </div>
    </div>
  );
}
