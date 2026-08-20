import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import {
  isProtocolSectionActive,
  protocolSections,
} from "@/config/protocol-sections";
import { ProtocolSectionIcon } from "./protocol-section-icon";

const sectionLinkClassName =
  "flex h-9 items-center gap-2.5 rounded-[0.5625rem] px-2 text-[0.8125rem] leading-tight text-muted transition-[background-color,color,box-shadow,transform] duration-150 hover:bg-soft hover:text-ink active:scale-[0.97] aria-[current=page]:bg-surface aria-[current=page]:font-medium aria-[current=page]:text-ink aria-[current=page]:shadow-[var(--shadow-surface)] aria-[current=page]:ring-1 aria-[current=page]:ring-line";

export function ProtocolContextRail() {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 items-center justify-between px-3">
        <Typography as="span" className="text-ink" variant="title">
          Protocol map
        </Typography>
        <Badge>v1.0</Badge>
      </div>
      <nav
        aria-label="Protocol sections"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [scrollbar-gutter:stable]"
      >
        <Typography
          as="div"
          className="px-2 pb-1.5 text-subtle"
          variant="label"
        >
          Sections
        </Typography>
        <div className="grid gap-1">
          {protocolSections.map((section) => {
            const active = isProtocolSectionActive(pathname, section.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={sectionLinkClassName}
                href={section.href}
                key={section.href}
              >
                <ProtocolSectionIcon
                  active={active}
                  compact
                  section={section}
                />
                {section.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-4 rounded-[0.875rem] border border-line bg-surface p-3">
          <Typography className="text-ink" variant="title">
            Core invariant
          </Typography>
          <Typography
            className="mt-2 font-semibold tracking-[-0.02em] text-accent-strong"
            variant="ui"
          >
            The LLM proposes.
            <br />
            The contract disposes.
          </Typography>
          <Typography className="mt-2 text-subtle" variant="caption">
            Model compromise cannot change the strategy set, custody assets,
            bypass limits, or choose an arbitrary receiver.
          </Typography>
        </div>
      </nav>
    </div>
  );
}
