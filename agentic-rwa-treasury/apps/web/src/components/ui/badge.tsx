import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";
export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn(typographyVariants.caption, "inline-flex h-5 items-center gap-1 rounded-full border border-line bg-soft px-2 font-medium leading-none text-muted", className)} {...props} />;
}
