"use client";

import { Button as Primitive } from "@base-ui/react/button";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";

export type ButtonProps = ComponentProps<typeof Primitive> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Primitive
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-[0.5625rem] border font-medium outline-none transition-[background,border-color,color,opacity,transform] duration-150 focus-visible:ring-2 focus-visible:ring-accent/25 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96]",
        size === "sm" ? cn(typographyVariants.caption, "h-7 px-2.5 leading-none") : cn(typographyVariants.ui, "h-8 px-3 leading-none"),
        variant === "primary" && "border-accent bg-accent text-ink hover:bg-accent-strong",
        variant === "secondary" && "border-line bg-surface text-ink hover:bg-soft",
        variant === "ghost" && "border-transparent bg-transparent text-muted hover:bg-soft hover:text-ink",
        variant === "danger" && "border-danger/20 bg-danger-soft text-danger hover:bg-danger/10",
        className,
      )}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      {...props}
    >
      {loading ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : leadingIcon}
      {children}
      {trailingIcon}
    </Primitive>
  );
}
