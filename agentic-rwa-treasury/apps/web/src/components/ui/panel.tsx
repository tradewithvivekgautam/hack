import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
export function Panel({ className, ...props }: ComponentProps<"section">) { return <section className={cn("rounded-[1.125rem] border border-line bg-surface", className)} {...props} />; }
export function PanelHeader({ title, description, action, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return <div className={cn("flex items-start justify-between gap-4 border-b border-line px-4 py-3", className)}><div className="min-w-0"><h2 className="text-[0.8125rem] font-semibold text-ink">{title}</h2>{description ? <p className="mt-0.5 text-xs leading-4 text-subtle">{description}</p> : null}</div>{action}</div>;
}
