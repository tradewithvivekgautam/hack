import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  blue: "bg-category-blue text-white",
  green: "bg-category-green text-white",
  violet: "bg-category-violet text-white",
  amber: "bg-category-amber text-white",
  orange: "bg-accent text-white",
  neutral: "bg-soft text-muted",
} as const;

export type IconTone = keyof typeof tones;

export function IconTile({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: IconTone }) {
  return <span aria-hidden="true" className={cn("grid size-7 shrink-0 place-items-center rounded-[0.5rem]", tones[tone], className)}>{children}</span>;
}
