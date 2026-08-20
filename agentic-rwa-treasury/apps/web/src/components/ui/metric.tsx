import type { ReactNode } from "react";
import { IconTile, type IconTone } from "./icon-tile";
import { Typography } from "./typography";

export function Metric({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  tone?: IconTone;
}) {
  return (
    <div className="flex min-h-[6.75rem] min-w-0 flex-col rounded-[0.75rem] border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <Typography as="div" className="text-muted" variant="caption">
          {label}
        </Typography>
        {icon ? (
          <IconTile className="size-6 rounded-[0.4375rem]" tone={tone}>
            {icon}
          </IconTile>
        ) : null}
      </div>
      <div className="mt-auto flex min-w-0 items-baseline gap-1.5 pt-3">
        <Typography as="div" className="truncate text-ink" variant="metric">
          {value}
        </Typography>
        {detail ? (
          <Typography
            as="div"
            className="truncate text-muted"
            variant="caption"
          >
            {detail}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}
