import {
  Bot,
  Braces,
  FileKey2,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import type { IconTone } from "@/components/ui/icon-tile";

export type ProtocolSection = {
  href: string;
  label: string;
  pageTitle: string;
  summary: string;
  icon: LucideIcon;
  tone: IconTone;
};

export const protocolSections = [
  {
    href: "/protocol",
    label: "Overview",
    pageTitle: "Protocol",
    summary:
      "Deterministic controls and on-chain sources of truth across the treasury system.",
    icon: ShieldCheck,
    tone: "orange",
  },
  {
    href: "/protocol/architecture",
    label: "Architecture",
    pageTitle: "Architecture",
    summary: "System boundaries, deterministic checks, and custody flow.",
    icon: Braces,
    tone: "blue",
  },
  {
    href: "/protocol/policy",
    label: "Policy simulator",
    pageTitle: "Policy simulator",
    summary: "Test a proposal against exact on-chain policy bounds.",
    icon: ShieldCheck,
    tone: "green",
  },
  {
    href: "/protocol/security",
    label: "Security model",
    pageTitle: "Security model",
    summary: "What an agent may propose and can never control.",
    icon: FileKey2,
    tone: "violet",
  },
  {
    href: "/protocol/contracts",
    label: "Contracts and records",
    pageTitle: "Contracts and records",
    summary: "Live addresses and canonical sources of truth.",
    icon: WalletCards,
    tone: "amber",
  },
  {
    href: "/protocol/pipeline",
    label: "Agent pipeline",
    pageTitle: "Agent pipeline",
    summary: "Every validation stage before a rebalance is submitted.",
    icon: Bot,
    tone: "orange",
  },
] as const satisfies readonly ProtocolSection[];

export const protocolChildSections = protocolSections.filter(
  (section) => section.href !== "/protocol",
);

export function getProtocolSection(href: string) {
  return protocolSections.find((section) => section.href === href);
}

export function isProtocolSectionActive(pathname: string, href: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (href === "/protocol") {
    return normalized === "/protocol";
  }

  return normalized === href;
}
