import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader, type CardHeaderProps } from "./card";

export function Panel(props: ComponentProps<"section">) {
  return <Card {...props} />;
}

export function PanelHeader(props: CardHeaderProps) {
  return <CardHeader {...props} />;
}

export function PanelContent({
  className,
  ...props
}: ComponentProps<"div">) {
  return <CardContent className={cn("p-4", className)} {...props} />;
}
