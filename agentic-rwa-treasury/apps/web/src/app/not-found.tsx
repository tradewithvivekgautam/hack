import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md rounded-[1.25rem] border border-line-strong bg-surface p-6 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">404</div>
        <h1 className="mt-2 text-[1rem] font-semibold text-ink">This protocol view does not exist</h1>
        <p className="mt-1 text-xs text-ink-secondary">Return to the live vault dashboard.</p>
        <Link
          className="mx-auto mt-4 inline-flex h-8 items-center justify-center gap-2 rounded-[0.5625rem] border border-accent bg-accent px-3 text-[0.8125rem] font-medium text-white hover:bg-accent-strong"
          href="/vault"
        >
          <ArrowLeft className="size-3.5" />
          Back to vault
        </Link>
      </div>
    </div>
  );
}
