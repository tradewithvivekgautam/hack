import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Typography, typographyVariants } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center bg-app p-6">
      <div className="surface-panel w-full max-w-md rounded-[0.875rem] p-6 text-center">
        <Typography as="div" className="font-semibold text-ink-muted" variant="label">404</Typography>
        <Typography as="h1" className="mt-2 text-ink" variant="heading">This protocol view does not exist</Typography>
        <Typography className="mt-1 text-ink-secondary" variant="body">Return to the live vault dashboard.</Typography>
        <Link
          className={cn(typographyVariants.ui, "mx-auto mt-4 inline-flex h-8 items-center justify-center gap-2 rounded-[0.5625rem] border border-accent bg-accent px-3 font-medium text-white hover:bg-accent-strong")}
          href="/vault"
        >
          <ArrowLeft className="size-3.5" />
          Back to vault
        </Link>
      </div>
    </div>
  );
}
