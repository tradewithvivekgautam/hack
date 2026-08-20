import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";

export type DescriptionListVariant = "default" | "summary";

const nestedDetailStyles =
  "[&_.description-details-note]:mt-1 [&_.description-details-note]:font-normal [&_.description-details-note]:[font-variant-numeric:normal] [&_.description-details-stack]:grid [&_.description-details-stack]:gap-0.5 [&_.description-details-subrow]:flex [&_.description-details-subrow]:items-start [&_.description-details-subrow]:justify-between [&_.description-details-subrow]:gap-3 [&_.description-details-subrow]:py-px [&_.description-details-subrow_label]:font-normal [&_.description-details-subrow_label]:text-subtle [&_.description-details-subrow_label]:[font-variant-numeric:normal] [&_.description-details-subrow_value]:font-medium [&_.description-details-subrow_value]:text-ink [&_.description-details-subrow_value]:tabular-nums [&_.description-details-prose]:space-y-2 [&_.description-details-prose]:text-left [&_.description-details-prose_p]:font-normal [&_.description-details-prose_p]:text-muted [&_.description-details-prose_p]:[font-variant-numeric:normal] [&_.description-details-prose_h3]:text-left [&_.description-details-prose_h3]:font-medium [&_.description-details-prose_h3]:text-ink";

const descriptionListVariants = {
  default: {
    row: "grid grid-cols-[minmax(7.5rem,38%)_minmax(0,1fr)] items-start gap-x-4 border-b border-line/70 py-2.5 last:border-b-0",
    term: cn(typographyVariants.ui, "m-0 self-start font-normal text-subtle"),
    details: cn(
      typographyVariants.ui,
      "m-0 min-w-0 self-start text-right font-medium text-ink tabular-nums",
      nestedDetailStyles,
    ),
  },
  summary: {
    row: "flex items-baseline justify-between gap-6 border-b border-line/35 py-3 first:pt-1 last:border-b-0",
    term: "m-0 min-w-0 max-w-[62%] text-[0.8125rem] font-normal leading-5 text-subtle",
    details: cn(
      "m-0 min-w-0 shrink-0 text-right text-[0.8125rem] font-semibold leading-5 tracking-[-0.01em] text-ink tabular-nums",
      nestedDetailStyles,
    ),
  },
} as const satisfies Record<
  DescriptionListVariant,
  { row: string; term: string; details: string }
>;

function groupDescriptionRows(children: ReactNode) {
  const rows: Array<[ReactElement | null, ReactElement | null]> = [];
  const items = Children.toArray(children).filter(isValidElement);

  for (let index = 0; index < items.length; index += 2) {
    rows.push([items[index] ?? null, items[index + 1] ?? null]);
  }

  return rows;
}

function renderRowChild(
  child: ReactElement | null,
  slot: "term" | "details",
  variant: DescriptionListVariant,
) {
  if (!child) return null;
  const styles = descriptionListVariants[variant];
  const props = child.props as ComponentProps<"dt"> | ComponentProps<"dd">;
  const Tag = slot === "term" ? "dt" : "dd";

  return (
    <Tag
      {...props}
      className={cn(
        slot === "term" ? styles.term : styles.details,
        props.className,
      )}
    />
  );
}

export function DescriptionList({
  className,
  children,
  variant = "default",
  ...props
}: ComponentProps<"dl"> & { variant?: DescriptionListVariant }) {
  const rows = groupDescriptionRows(children);
  const styles = descriptionListVariants[variant];

  return (
    <dl
      data-slot="description-list"
      data-variant={variant}
      className={cn("m-0 grid gap-0", className)}
      {...props}
    >
      {rows.map(([term, details], index) => (
        <div className={styles.row} data-slot="description-row" key={index}>
          {renderRowChild(term, "term", variant)}
          {renderRowChild(details, "details", variant)}
        </div>
      ))}
    </dl>
  );
}

export function DescriptionTerm({
  className,
  ...props
}: ComponentProps<"dt">) {
  return (
    <dt
      data-slot="description-term"
      className={cn(
        typographyVariants.ui,
        "m-0 self-start font-normal text-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function DescriptionDetails({
  className,
  ...props
}: ComponentProps<"dd">) {
  return (
    <dd
      data-slot="description-details"
      className={cn(
        typographyVariants.ui,
        "m-0 min-w-0 self-start text-right font-medium text-ink tabular-nums",
        nestedDetailStyles,
        className,
      )}
      {...props}
    />
  );
}

/** Small helper copy under a value, e.g. doctor selection hint. */
export function DescriptionDetailsNote({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "description-details-note",
        typographyVariants.caption,
        "text-subtle",
        className,
      )}
      {...props}
    />
  );
}

/** Nested label/value rows inside a detail cell, e.g. max out-of-pocket tiers. */
export function DescriptionDetailsStack({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("description-details-stack", className)} {...props} />
  );
}

export function DescriptionDetailsSubrow({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("description-details-subrow", className)}>
      <span className="description-details-subrow_label">{label}</span>
      <span className="description-details-subrow_value">{children}</span>
    </div>
  );
}

/** Long-form detail blocks with headings and paragraphs. */
export function DescriptionDetailsProse({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("description-details-prose", className)} {...props} />
  );
}

export function DescriptionListSection({
  title,
  children,
  className,
  description,
  variant = "summary",
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  variant?: DescriptionListVariant;
}) {
  return (
    <section className={cn("grid gap-2", className)}>
      <div className="grid gap-0.5">
        <h3
          className={cn(
            typographyVariants.label,
            "text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-subtle",
          )}
        >
          {title}
        </h3>
        {description ? (
          <p className={cn(typographyVariants.caption, "text-subtle")}>
            {description}
          </p>
        ) : null}
      </div>
      <DescriptionList variant={variant}>{children}</DescriptionList>
    </section>
  );
}
