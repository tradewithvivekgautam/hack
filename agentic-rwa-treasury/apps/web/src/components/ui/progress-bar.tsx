import { cn } from "@/lib/cn";

export function ProgressBar({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-surface-hover", className)}>
      <div
        className={cn("h-full rounded-full bg-accent transition-[width] duration-300", indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
