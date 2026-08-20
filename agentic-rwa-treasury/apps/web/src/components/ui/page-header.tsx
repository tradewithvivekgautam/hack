import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Typography } from "./typography";

export function PageHeader({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-3", className)}>
      {icon}
      <div className="grid min-w-0 gap-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Typography as="h1" className="min-w-0 text-ink" variant="heading">
            {title}
          </Typography>
          {action}
        </div>
        {description ? (
          <Typography className="text-subtle" variant="body">
            {description}
          </Typography>
        ) : null}
      </div>
    </header>
  );
}
