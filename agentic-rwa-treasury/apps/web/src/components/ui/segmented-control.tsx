"use client";

import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  items,
}: {
  value: T;
  onValueChange: (value: T) => void;
  items: readonly { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-[0.75rem] bg-surface-muted p-0.5">
      {items.map((item) => (
        <button
          key={item.value}
          className={cn(
            typographyVariants.caption,
            "h-7 rounded-[0.5625rem] px-2.5 font-medium leading-none transition-colors",
            value === item.value ? "bg-surface text-ink shadow-sm" : "text-ink-secondary hover:text-ink",
          )}
          onClick={() => onValueChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
