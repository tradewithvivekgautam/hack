import type { SourceStatus } from "@/features/sources/model/types";

const now = Date.now();
const minutesAgo = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now - hours * 3600 * 1000).toISOString();

export const demoSources: readonly SourceStatus[] = [
  {
    id: "rwa-fund-factsheet",
    title: "Short-duration tokenized credit fund factsheet",
    kind: "Fund factsheet",
    publishedAt: hoursAgo(24),
    fetchedAt: minutesAgo(42),
    contentHash: `0x${"31".repeat(32)}`,
    stale: false,
    description: "NAV, duration, gross yield, spread, and redemption terms for the RWA sleeve.",
    integration: "fixture",
  },
  {
    id: "private-credit-memo",
    title: "Private-credit monitoring memorandum",
    kind: "Credit memo",
    publishedAt: hoursAgo(18),
    fetchedAt: minutesAgo(35),
    contentHash: `0x${"32".repeat(32)}`,
    stale: false,
    description: "Obligor concentration, advance-rate, servicing, and redemption-risk monitoring.",
    integration: "fixture",
  },
  {
    id: "rate-statement",
    title: "Monetary-policy statement extract",
    kind: "Rate announcement",
    publishedAt: hoursAgo(48),
    fetchedAt: minutesAgo(28),
    contentHash: `0x${"33".repeat(32)}`,
    stale: false,
    description: "Liquid benchmark rates and the changing opportunity cost of credit exposure.",
    integration: "fixture",
  },
  {
    id: "okx-liquidity-snapshot",
    title: "OKX DEX exit-liquidity quote",
    kind: "Liquidity",
    publishedAt: minutesAgo(10),
    fetchedAt: minutesAgo(5),
    contentHash: `0x${"34".repeat(32)}`,
    stale: false,
    description: "Point-in-time route depth, estimated price impact, and exit slippage on X Layer mainnet.",
    integration: "live",
  },
  {
    id: "xlayer-vault-state",
    title: "Vault and adapter state",
    kind: "On-chain state",
    publishedAt: minutesAgo(2),
    fetchedAt: minutesAgo(1),
    contentHash: `0x${"35".repeat(32)}`,
    stale: false,
    description: "Current balances, APYs, policy limits, cooldown, and recent decisions read from X Layer.",
    integration: "chain",
  },
];
