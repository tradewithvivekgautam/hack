"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md rounded-[1.25rem] border border-line-strong bg-surface p-6 text-center shadow-xl">
        <AlertTriangle className="mx-auto size-6 text-danger" />
        <h1 className="mt-3 text-[1rem] font-semibold text-ink">The interface could not continue</h1>
        <p className="mt-1 text-xs text-ink-secondary">{error.message}</p>
        <Button className="mt-4" leadingIcon={<RotateCcw className="size-3.5" />} onClick={reset} variant="primary">
          Retry
        </Button>
      </div>
    </div>
  );
}
