"use client";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";

export const DialogRoot = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export function DialogContent({ title, description, children, className }: { title: ReactNode; description?: ReactNode; children: ReactNode; className?: string }) {
  return <Primitive.Portal><Primitive.Backdrop className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-[0.125rem] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" /><Primitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4"><Primitive.Popup className={cn("relative w-full max-w-[27rem] rounded-[1.125rem] border border-line bg-surface p-4 shadow-[0_1rem_4rem_rgba(25,25,24,0.13)] outline-none transition-[opacity,transform] data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0", className)}><div className="pr-8"><Primitive.Title className="text-[0.875rem] font-semibold text-ink">{title}</Primitive.Title>{description ? <Primitive.Description className="mt-1 text-xs leading-5 text-subtle">{description}</Primitive.Description> : null}</div><Primitive.Close render={<IconButton aria-label="Close dialog" />} className="absolute right-3 top-3"><X className="size-3.5" /></Primitive.Close><div className="mt-4">{children}</div></Primitive.Popup></Primitive.Viewport></Primitive.Portal>;
}
