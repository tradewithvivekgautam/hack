import type { ReactNode } from "react";
export function Metric({ label, value, detail, icon }: { label: ReactNode; value: ReactNode; detail?: ReactNode; icon?: ReactNode }) {
  return <div className="min-w-0 rounded-[0.875rem] border border-line bg-surface px-3.5 py-3"><div className="flex items-center justify-between gap-3 text-xs text-subtle"><span>{label}</span>{icon}</div><div className="mt-2 truncate text-base font-semibold tracking-[-0.02em] text-ink">{value}</div>{detail ? <div className="mt-1 text-xs text-muted">{detail}</div> : null}</div>;
}
