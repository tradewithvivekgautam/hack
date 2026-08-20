import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const headClassName =
  "h-8 whitespace-nowrap border-b border-line px-2.5 py-1.5 text-left align-middle text-[0.6875rem] font-medium leading-none tracking-[0.02em] text-subtle first:pl-3 last:pr-3 has-[[role=checkbox]]:pr-0";

const cellClassName =
  "h-9 border-b border-line px-2.5 py-1.5 align-middle text-[0.8125rem] leading-tight text-muted first:pl-3 last:pr-3 has-[[role=checkbox]]:pr-0";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full min-w-0 overflow-x-auto overscroll-x-contain"
    >
      <table
        data-slot="table"
        className={cn(
          "w-full min-w-[32rem] caption-bottom border-collapse text-left",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-surface-muted", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child_td]:border-b-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-line bg-surface-muted font-medium", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors duration-150 hover:bg-soft/60 data-[state=selected]:bg-soft/80",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th data-slot="table-head" className={cn(headClassName, className)} {...props} />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(cellClassName, "whitespace-nowrap", className)}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-2 text-[0.6875rem] text-subtle", className)}
      {...props}
    />
  );
}
