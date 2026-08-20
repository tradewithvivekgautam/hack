"use client";
import { Tabs as Primitive } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";
export const TabsRoot = Primitive.Root;
export function TabsList({ className, ...props }: ComponentProps<typeof Primitive.List>) { return <Primitive.List className={cn("relative flex h-8 rounded-[0.625rem] border border-line bg-soft p-0.5", className)} {...props} />; }
export function TabsTab({ className, ...props }: ComponentProps<typeof Primitive.Tab>) { return <Primitive.Tab className={cn(typographyVariants.caption, "relative z-10 flex-1 rounded-[0.4375rem] px-3 font-medium leading-none text-muted outline-none data-active:text-ink focus-visible:ring-2 focus-visible:ring-accent/20", className)} {...props} />; }
export function TabsIndicator({ className, ...props }: ComponentProps<typeof Primitive.Indicator>) { return <Primitive.Indicator className={cn("absolute inset-y-0.5 z-0 rounded-[0.4375rem] border border-line bg-surface shadow-sm transition-[left,width]", className)} {...props} />; }
export const TabsPanel = Primitive.Panel;
