"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { typographyVariants } from "@/components/ui/typography";
import { isPrimaryNavActive, primaryNavigation } from "@/config/navigation";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <DialogRoot>
      <DialogTrigger
        aria-label="Open navigation"
        render={<IconButton className="lg:hidden" />}
      >
        <Menu className="size-4" />
      </DialogTrigger>
      <DialogContent title="Navigation">
        <nav className="grid gap-1">
          {primaryNavigation.map(({ href, label, icon: Icon }) => {
            const active = isPrimaryNavActive(pathname, href);
            return (
              <DialogClose
                key={href}
                render={
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      typographyVariants.ui,
                      "flex h-9 items-center gap-2 rounded-[0.5625rem] px-3 font-medium transition-[background-color,color] duration-150",
                      active
                        ? "bg-soft text-ink ring-1 ring-line"
                        : "text-muted hover:bg-soft hover:text-ink",
                    )}
                    href={href}
                  />
                }
              >
                <Icon className="size-4" strokeWidth={active ? 2 : 1.75} />
                {label}
              </DialogClose>
            );
          })}
        </nav>
      </DialogContent>
    </DialogRoot>
  );
}
