import { cn } from "@/lib/cn";

export function StatusDot({ status, className }: { status: "success" | "warning" | "danger" | "neutral"; className?: string }) {
  const styles = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    neutral: "bg-ink-muted",
  } as const;
  return <span className={cn("inline-block size-1.5 rounded-full", styles[status], className)} aria-hidden="true" />;
}
