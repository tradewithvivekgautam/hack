import { cn } from "@/lib/cn";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-6 place-items-center rounded-lg bg-accent text-xs font-semibold text-white shadow-[0_0_0_0.1875rem_rgba(249,129,35,0.12)]">
        A
      </div>
      <div className={cn(compact && "hidden min-[25rem]:block")}>
        <div className="text-[0.8125rem] font-semibold tracking-[-0.02em] text-ink">
          Arca
        </div>
        <div className="text-xs uppercase tracking-[0.08em] text-subtle">
          RWA treasury
        </div>
      </div>
    </div>
  );
}
