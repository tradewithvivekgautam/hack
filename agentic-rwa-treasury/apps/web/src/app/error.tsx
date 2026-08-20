"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="flex min-h-full items-center justify-center bg-app p-6">
      <div className="surface-panel w-full max-w-md rounded-[0.875rem] p-6 text-center">
        <AlertTriangle className="mx-auto size-6 text-danger" />
        <Typography as="h1" className="mt-3 text-ink" variant="heading">The interface could not continue</Typography>
        <Typography className="mt-1 text-ink-secondary" variant="body">{error.message}</Typography>
        <Button className="mt-4" leadingIcon={<RotateCcw className="size-3.5" />} onClick={reset} variant="primary">
          Retry
        </Button>
      </div>
    </div>
  );
}
