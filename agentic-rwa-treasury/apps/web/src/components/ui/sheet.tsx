"use client";

import { Drawer } from "@base-ui/react/drawer";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";

export const Sheet = Drawer.Root;
export const SheetRoot = Sheet;
export const SheetTrigger = Drawer.Trigger;
export const SheetClose = Drawer.Close;

type SheetContentProps = ComponentProps<typeof Drawer.Popup> & {
  side?: "right" | "left";
  children: ReactNode;
};

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: SheetContentProps) {
  const slideClass =
    side === "right"
      ? "data-ending-style:translate-x-full data-starting-style:translate-x-full"
      : "data-ending-style:-translate-x-full data-starting-style:-translate-x-full";

  const viewportClass =
    side === "right" ? "justify-end pr-2" : "justify-start pl-2";

  return (
    <Drawer.Portal>
      <Drawer.Backdrop className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-[0.1875rem] transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
      <Drawer.Viewport
        className={cn(
          "fixed inset-0 z-50 flex overscroll-contain py-2 motion-reduce:transition-none",
          viewportClass,
        )}
      >
        <Drawer.Popup
          className={cn(
            "flex h-full w-full max-w-[min(42rem,60vw)] flex-col overflow-hidden rounded-l-[1.5rem] border border-line bg-surface shadow-[0_1.25rem_3.5rem_rgba(25,25,24,0.14)] outline-none transition-[transform,opacity] duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
            slideClass,
            className,
          )}
          {...props}
        >
          {children}
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  );
}

export function SheetHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("relative shrink-0 border-b border-line/70 px-6 pb-4 pt-5", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof Drawer.Title>) {
  return (
    <Drawer.Title
      className={cn(
        typographyVariants.heading,
        "pr-10 text-[1.375rem] leading-tight tracking-[-0.02em] text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof Drawer.Description>) {
  return (
    <Drawer.Description
      className={cn(typographyVariants.caption, "mt-1 text-subtle", className)}
      {...props}
    />
  );
}

export function SheetBody({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex shrink-0 flex-col-reverse gap-2 border-t border-line/70 px-6 py-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
