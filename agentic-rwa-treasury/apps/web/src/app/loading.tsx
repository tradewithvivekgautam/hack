import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="app-stage">
      <div className="min-h-[calc(100vh-5rem)] rounded-[1.75rem] bg-app p-6">
        <Skeleton className="h-10 w-48" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="mt-4 h-80" />
      </div>
    </div>
  );
}
