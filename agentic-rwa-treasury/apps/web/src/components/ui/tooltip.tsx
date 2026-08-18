"use client";

import { Tooltip as Primitive } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

export const TooltipProvider = Primitive.Provider;

export function Tooltip({
  trigger,
  children,
  content,
}: {
  trigger?: ReactElement;
  children?: ReactNode;
  content?: ReactNode;
}) {
  const triggerNode = trigger ?? (children as ReactElement);
  const popupContent = content ?? (trigger ? children : null);
  return (
    <Primitive.Root>
      <Primitive.Trigger render={triggerNode} />
      <Primitive.Portal>
        <Primitive.Positioner sideOffset={6}>
          <Primitive.Popup className="z-[70] max-w-64 rounded-md border border-ink/10 bg-ink px-2 py-1 text-xs leading-4 text-white shadow-lg transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0">
            {popupContent}
          </Primitive.Popup>
        </Primitive.Positioner>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
