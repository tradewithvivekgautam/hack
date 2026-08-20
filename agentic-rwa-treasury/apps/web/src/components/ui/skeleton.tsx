import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-soft motion-reduce:animate-none motion-reduce:bg-line/70",
        className,
      )}
      {...props}
    />
  );
}
