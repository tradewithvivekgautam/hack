import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Typography } from "./typography";

export type CardHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      data-slot="card"
      className={cn("surface-panel rounded-[0.75rem] bg-surface", className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <header
      data-slot="card-header"
      className={cn(
        "flex min-h-[3rem] items-start justify-between gap-3 border-b border-line px-3 py-3",
        className,
      )}
      {...props}
    >
      <div className="grid min-w-0 gap-0.5">
        <Typography as="h2" className="text-ink" variant="title">
          {title}
        </Typography>
        {description ? (
          <Typography className="text-subtle" variant="ui">
            {description}
          </Typography>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-3", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      data-slot="card-footer"
      className={cn("border-t border-line px-3 py-2", className)}
      {...props}
    />
  );
}
