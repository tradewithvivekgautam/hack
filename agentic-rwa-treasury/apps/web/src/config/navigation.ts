import { DatabaseZap, Landmark, ScrollText, ShieldCheck } from "lucide-react";

export const primaryNavigation = [
  { href: "/vault", label: "Vault", icon: Landmark },
  { href: "/decisions", label: "Decision log", icon: ScrollText },
  { href: "/sources", label: "Data sources", icon: DatabaseZap },
  { href: "/protocol", label: "Protocol", icon: ShieldCheck },
] as const;

export type PrimaryNavItem = (typeof primaryNavigation)[number];

export function isPrimaryNavActive(pathname: string, href: PrimaryNavItem["href"]) {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (href === "/vault") {
    return normalized === "/" || normalized === "/vault" || normalized.startsWith("/vault/");
  }

  if (normalized === href) return true;
  return normalized.startsWith(`${href}/`);
}
