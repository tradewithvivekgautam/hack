import { cn } from "@/lib/cn";
import { Typography } from "@/components/ui/typography";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Typography as="div" className="grid size-6 place-items-center rounded-lg bg-accent font-semibold text-white shadow-[0_0_0_0.1875rem_rgba(249,129,35,0.12)]" variant="caption">
        A
      </Typography>
      <div className={cn(compact && "hidden")}>
        <Typography as="div" className="font-semibold tracking-[-0.02em] text-ink" variant="ui">
          Arca
        </Typography>
        <Typography as="div" className="uppercase tracking-[0.08em] text-subtle" variant="caption">
          RWA treasury
        </Typography>
      </div>
    </div>
  );
}
