import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

export const typographyVariants = {
  caption:
    "text-[0.75rem] font-normal leading-[1rem] tracking-normal",
  label:
    "text-[0.75rem] font-medium leading-[1rem] tracking-[0.055em] uppercase",
  ui: "text-[0.8125rem] font-normal leading-[1.125rem] tracking-normal",
  body:
    "max-w-[65ch] break-words text-pretty text-[0.8125rem] font-normal leading-[1.25rem] tracking-normal",
  title:
    "text-balance text-[0.875rem] font-medium leading-[1.125rem] tracking-[-0.01em]",
  heading:
    "text-balance text-[0.875rem] font-semibold leading-[1.125rem] tracking-[-0.015em]",
  metric:
    "text-[1rem] font-medium leading-[1.25rem] tracking-[-0.02em] tabular-nums",
} as const;

export type TypographyVariant = keyof typeof typographyVariants;

type TypographyProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Typography<T extends ElementType = "p">({
  as,
  className,
  variant = "ui",
  ...props
}: TypographyProps<T>) {
  const Component = as ?? "p";
  return (
    <Component
      className={cn(typographyVariants[variant], className)}
      {...props}
    />
  );
}
