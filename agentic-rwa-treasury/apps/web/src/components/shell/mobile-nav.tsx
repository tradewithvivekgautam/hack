"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import {
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { primaryNavigation } from "@/config/navigation";

export function MobileNav() {
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
          {primaryNavigation.map(({ href, label, icon: Icon }) => (
            <DialogClose
              key={href}
              render={
                <Link
                  className="flex h-9 items-center gap-2 rounded-[0.5625rem] px-3 text-[0.8125rem] font-medium text-muted hover:bg-soft hover:text-ink"
                  href={href}
                />
              }
            >
              <Icon className="size-4" />
              {label}
            </DialogClose>
          ))}
        </nav>
      </DialogContent>
    </DialogRoot>
  );
}
