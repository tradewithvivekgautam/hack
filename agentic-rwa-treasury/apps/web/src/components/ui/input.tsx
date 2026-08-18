import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("h-8 w-full rounded-[0.5625rem] border border-line bg-surface px-2.5 text-[0.8125rem] text-ink outline-none placeholder:text-subtle focus:border-accent/55 focus:ring-2 focus:ring-accent/10 disabled:opacity-50", className)} {...props} />;
}
