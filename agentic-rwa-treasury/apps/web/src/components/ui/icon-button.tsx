"use client";
import type { ComponentProps } from "react";
import { Button } from "./button";
import { cn } from "@/lib/cn";
export function IconButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button size="sm" variant="ghost" className={cn("size-7 p-0", className)} {...props} />;
}
