import { BookOpenText, DatabaseZap, Landmark, ScrollText } from "lucide-react";

export const primaryNavigation = [
  { href: "/vault", label: "Vault", icon: Landmark },
  { href: "/decisions", label: "Decision log", icon: ScrollText },
  { href: "/sources", label: "Data sources", icon: DatabaseZap },
  { href: "/protocol", label: "Protocol", icon: BookOpenText },
] as const;
