"use client";
import { Field as Primitive } from "@base-ui/react/field";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";
export function Field({ label, error, description, children, className }: { label: ReactNode; error?: ReactNode; description?: ReactNode; children: ReactNode; className?: string }) {
  return <Primitive.Root invalid={Boolean(error)} className={cn("grid gap-1.5", className)}>
    <Primitive.Label className={cn(typographyVariants.ui, "font-medium text-muted")}>{label}</Primitive.Label>
    {children}
    {error ? <Primitive.Error className={cn(typographyVariants.ui, "text-danger")}>{error}</Primitive.Error> : null}
    {description ? <Primitive.Description className={cn(typographyVariants.caption, "text-subtle")}>{description}</Primitive.Description> : null}
  </Primitive.Root>;
}
