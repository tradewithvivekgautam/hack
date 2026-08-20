import type { ProtocolSection } from "@/config/protocol-sections";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/cn";

export function ProtocolTableLeadCell({
  section,
  className,
}: {
  section: ProtocolSection;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-[8rem] items-center gap-2", className)}>
      <ProtocolSectionIcon compact section={section} />
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[0.8125rem] font-medium text-ink">
          {section.label}
        </div>
        <div className="truncate text-[0.6875rem] text-subtle">
          {section.summary}
        </div>
      </div>
    </div>
  );
}

export function ProtocolSectionIcon({
  section,
  className,
  compact = false,
  active = false,
}: {
  section: ProtocolSection;
  className?: string;
  compact?: boolean;
  active?: boolean;
}) {
  const Icon = section.icon;

  return (
    <IconTile
      className={cn(
        compact ? "size-6 rounded-[0.4375rem]" : "size-8 rounded-[0.5rem]",
        className,
      )}
      tone={section.tone}
    >
      <Icon
        className={compact ? "size-3.5" : "size-3.5"}
        strokeWidth={active ? 2 : 1.75}
      />
    </IconTile>
  );
}
