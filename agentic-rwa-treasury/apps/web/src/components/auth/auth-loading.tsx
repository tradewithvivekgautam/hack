import { Logo } from "@/components/shell/logo";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Restoring wallet connection"
      className="fixed inset-0 z-50 grid min-h-dvh place-items-center bg-canvas p-4"
    >
      <div className="grid w-full max-w-[22rem] justify-items-center gap-4">
        <Logo />
        <div className="grid w-full gap-3 rounded-[0.875rem] border border-line bg-surface p-4">
          <Skeleton className="mx-auto size-10 rounded-[0.625rem]" />
          <Skeleton className="mx-auto h-4 w-40" />
          <Skeleton className="h-10 w-full rounded-[0.5625rem]" />
        </div>
      </div>
    </main>
  );
}
