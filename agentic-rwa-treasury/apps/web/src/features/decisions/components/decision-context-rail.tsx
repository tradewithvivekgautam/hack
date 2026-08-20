"use client";

import { useDebouncedValue } from "@tanstack/react-pacer";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Link2, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatEpoch, formatRelativeDate } from "@/lib/format";
import type { DecisionRecord } from "../model/types";

export function DecisionContextRail({
  decisions,
  selectedEpoch,
  onSelect,
}: {
  decisions: readonly DecisionRecord[];
  selectedEpoch: number;
  onSelect: (epoch: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, { wait: 180 });
  const parentRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return decisions;
    return decisions.filter((decision) =>
      [formatEpoch(decision.epoch), decision.modelId, decision.confidence, decision.reasoningCid]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [decisions, debouncedSearch]);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 3.75 * 16,
    overscan: 8,
    useFlushSync: false,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 items-center justify-between px-3">
        <span className="type-title text-ink">Decision epochs</span>
        <Badge>{decisions.length} records</Badge>
      </div>
      <div className="border-b border-line p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
          <Input className="pl-8" onChange={(event) => setSearch(event.target.value)} placeholder="Search epochs" type="search" value={search} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto [scrollbar-gutter:stable]" ref={parentRef}>
        <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize() / 16}rem` }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const decision = filtered[virtualItem.index];
            if (!decision) return null;
            const active = decision.epoch === selectedEpoch;
            return (
              <button
                className={cn(
                  "absolute left-0 top-0 flex w-full items-center gap-2 border-b border-line px-3 text-left transition-colors hover:bg-soft",
                  active && "bg-soft",
                )}
                key={decision.epoch}
                onClick={() => onSelect(decision.epoch)}
                style={{ height: `${virtualItem.size / 16}rem`, transform: `translateY(${virtualItem.start / 16}rem)` }}
                type="button"
              >
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-[0.5rem] border border-category-violet bg-category-violet type-caption font-semibold text-white", active && "ring-2 ring-category-violet/20 ring-offset-1")}>
                  {decision.epoch}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 type-ui font-medium text-ink">
                    {formatEpoch(decision.epoch)}
                    <Link2 className="size-3 text-subtle" aria-label="On-chain record" />
                  </span>
                  <span className="mt-0.5 block truncate type-caption text-subtle">{formatRelativeDate(decision.timestamp)}</span>
                </span>
                <span className={cn("size-1.5 rounded-full", decision.confidence === "high" ? "bg-success" : decision.confidence === "low" ? "bg-warning" : "bg-accent")} />
              </button>
            );
          })}
        </div>
        {!filtered.length ? <div className="p-5 text-center type-ui text-subtle">No matching epochs.</div> : null}
      </div>
      <div className="border-t border-line p-3 type-caption text-subtle">Every record is loaded from the registry. Its full memo is resolved from the committed IPFS CID.</div>
    </div>
  );
}
