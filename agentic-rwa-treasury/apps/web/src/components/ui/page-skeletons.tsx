import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./skeleton";

export function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="grid gap-3">
      <Skeleton className="size-8 rounded-[0.5rem]" />
      <div className="grid min-w-0 gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-44 max-w-full" />
          {action ? <Skeleton className="h-6 w-24 rounded-full" /> : null}
        </div>
        <Skeleton className="h-3 w-full max-w-xl" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
    </div>
  );
}

export function DashboardToolbarSkeleton() {
  return (
    <div className="dashboard-toolbar">
      <Skeleton className="h-4 w-52 max-w-full" />
      <Skeleton className="h-6 w-28 rounded-full" />
    </div>
  );
}

export function MetricStripSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="dashboard-metric-strip">
      {Array.from({ length: count }, (_, index) => (
        <div className="rounded-[0.625rem] bg-surface p-3" key={index}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-16" />
          <Skeleton className="mt-1 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[0.875rem] border border-line bg-surface",
        className,
      )}
    >
      <div className="border-b border-line px-4 py-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1.5 h-3 w-56 max-w-full" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }, (_, index) => (
          <div className="flex h-9 items-center gap-2 px-2.5" key={index}>
            <Skeleton className="size-6 shrink-0 rounded-[0.375rem]" />
            <Skeleton className="h-3 w-36 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartPanelSkeleton() {
  return (
    <div className="overflow-hidden rounded-[0.875rem] border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-1.5 h-3 w-40" />
      </div>
      <div className="p-4">
        <Skeleton className="h-48 w-full rounded-[0.625rem]" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  columns = 2,
}: {
  count?: number;
  columns?: 2 | 3;
}) {
  const gridClass =
    columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          className="rounded-[0.875rem] border border-line bg-surface p-3"
          key={index}
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="size-7 rounded-[0.5rem]" />
            <Skeleton className="h-3 w-4" />
          </div>
          <Skeleton className="mt-3 h-4 w-36 max-w-full" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-[80%]" />
        </div>
      ))}
    </div>
  );
}

export function ContextRailSkeleton() {
  return (
    <div className="space-y-3 p-3">
      <div className="flex h-12 items-center justify-between px-0">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-10 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-[0.875rem]" />
      <Skeleton className="h-9 w-full rounded-[0.5625rem]" />
      <Skeleton className="h-9 w-full rounded-[0.5625rem]" />
      <Skeleton className="h-32 w-full rounded-[0.875rem]" />
    </div>
  );
}

function PageSkeletonShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="page-shell dashboard-grid pb-24 lg:pb-6"
    >
      {children}
    </div>
  );
}

export function VaultPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading vault">
      <PageHeaderSkeleton action />
      <DashboardToolbarSkeleton />
      <MetricStripSkeleton />
      <ChartPanelSkeleton />
      <PanelSkeleton rows={3} />
      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <Skeleton className="h-64 rounded-[0.875rem]" />
        <div className="grid gap-3">
          <Skeleton className="h-44 rounded-[0.875rem]" />
          <Skeleton className="h-32 rounded-[0.875rem]" />
        </div>
      </div>
    </PageSkeletonShell>
  );
}

export function SourcesPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading data sources">
      <PageHeaderSkeleton />
      <DashboardToolbarSkeleton />
      <MetricStripSkeleton count={3} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-28 rounded-[0.875rem]" key={index} />
        ))}
      </div>
      <PanelSkeleton rows={6} />
    </PageSkeletonShell>
  );
}

export function DecisionsPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading decision log">
      <PageHeaderSkeleton action />
      <DashboardToolbarSkeleton />
      <MetricStripSkeleton />
      <ChartPanelSkeleton />
      <Skeleton className="h-36 rounded-[0.875rem]" />
      <PanelSkeleton rows={4} />
    </PageSkeletonShell>
  );
}

export function ProtocolOverviewSkeleton() {
  return (
    <PageSkeletonShell label="Loading protocol">
      <PageHeaderSkeleton action />
      <DashboardToolbarSkeleton />
      <MetricStripSkeleton />
      <PanelSkeleton rows={5} />
      <Skeleton className="h-28 rounded-[0.875rem]" />
    </PageSkeletonShell>
  );
}

export function ProtocolArchitectureSkeleton() {
  return (
    <PageSkeletonShell label="Loading architecture">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} columns={2} />
    </PageSkeletonShell>
  );
}

export function ProtocolContractsSkeleton() {
  return (
    <PageSkeletonShell label="Loading contracts">
      <PageHeaderSkeleton />
      <PanelSkeleton rows={7} />
      <PanelSkeleton rows={6} />
    </PageSkeletonShell>
  );
}

export function ProtocolPipelineSkeleton() {
  return (
    <PageSkeletonShell label="Loading agent pipeline">
      <PageHeaderSkeleton />
      <PanelSkeleton rows={9} />
      <Skeleton className="h-16 rounded-[0.875rem]" />
    </PageSkeletonShell>
  );
}

export function ProtocolPolicySkeleton() {
  return (
    <PageSkeletonShell label="Loading policy simulator">
      <PageHeaderSkeleton action />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
        <Skeleton className="h-[28rem] rounded-[0.875rem]" />
        <Skeleton className="h-72 rounded-[0.875rem]" />
      </div>
    </PageSkeletonShell>
  );
}

export function ProtocolSecuritySkeleton() {
  return (
    <PageSkeletonShell label="Loading security model">
      <PageHeaderSkeleton />
      <PanelSkeleton rows={4} />
      <div className="grid gap-3 md:grid-cols-2">
        <PanelSkeleton rows={4} />
        <PanelSkeleton rows={4} />
      </div>
    </PageSkeletonShell>
  );
}

export function DecisionEnvelopeSkeleton() {
  return (
    <div className="grid gap-3">
      <PanelSkeleton rows={3} />
      <PanelSkeleton rows={6} />
    </div>
  );
}
