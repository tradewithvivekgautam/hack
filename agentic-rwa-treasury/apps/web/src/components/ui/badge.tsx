import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex h-5 items-center gap-1 rounded-full border border-line bg-soft px-2 text-xs font-medium text-muted", className)} {...props} />;
}
