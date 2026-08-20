import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const avatarStyles = [
  "bg-category-blue text-white",
  "bg-accent text-white",
  "bg-category-violet text-white",
  "bg-category-green text-white",
  "bg-category-amber text-white",
  "bg-danger text-white",
] as const;

export function getTableAvatarStyle(seed: string) {
  const hash = [...seed].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return avatarStyles[hash % avatarStyles.length] ?? avatarStyles[0];
}

export function TableLeadCell({
  seed,
  title,
  subtitle,
  icon: Icon,
  className,
}: {
  seed: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  const style = getTableAvatarStyle(seed);
  const initial =
    typeof title === "string" && title.length > 0
      ? title.trim().charAt(0).toUpperCase()
      : "?";

  return (
    <div className={cn("flex min-w-[8rem] items-center gap-2", className)}>
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-[0.375rem] text-[0.625rem] font-semibold leading-none",
          style,
        )}
      >
        {Icon ? (
          <Icon className="size-3 text-white" strokeWidth={2} />
        ) : (
          initial
        )}
      </span>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[0.8125rem] font-medium text-ink">
          {title}
        </div>
        {subtitle ? (
          <div className="truncate text-[0.6875rem] text-subtle">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

export function TablePill({
  children,
  className,
  icon: Icon,
}: {
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-line bg-surface px-2 text-[0.6875rem] font-medium text-muted",
        className,
      )}
    >
      {Icon ? <Icon className="size-2.5 shrink-0" strokeWidth={2} /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function TableStackedMetric({
  primary,
  secondary,
  className,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-[4.75rem] leading-tight", className)}>
      <div className="text-[0.8125rem] font-medium text-ink">{primary}</div>
      {secondary ? (
        <div className="text-[0.6875rem] text-subtle">{secondary}</div>
      ) : null}
    </div>
  );
}
