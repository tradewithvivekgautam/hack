"use client";
import { Switch as Primitive } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
export function Switch({ className, ...props }: ComponentProps<typeof Primitive.Root>) { return <Primitive.Root className={cn("relative inline-flex h-5 w-8 rounded-full border border-line bg-soft p-0.5 outline-none transition-colors data-checked:border-accent data-checked:bg-accent focus-visible:ring-2 focus-visible:ring-accent/20", className)} {...props}><Primitive.Thumb className="size-3.5 rounded-full bg-white shadow-sm transition-transform data-checked:translate-x-3" /></Primitive.Root>; }
