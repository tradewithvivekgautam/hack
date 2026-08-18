import { formatDistanceToNowStrict } from "date-fns";
import { formatUnits } from "viem";

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});
const fullUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const utcDateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatUsd(value: number, compact = false) {
  return (compact ? compactUsd : fullUsd).format(value);
}

export function formatToken(value: bigint, decimals = 6, digits = 2) {
  return Number(formatUnits(value, decimals)).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatTokenUsd(value: bigint, compact = false) {
  return formatUsd(Number(formatUnits(value, 6)), compact);
}

export function formatBps(value: number) {
  return percent.format(value / 10_000);
}

export function formatInteger(value: number | bigint) {
  return integer.format(value);
}

export function formatAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function formatHash(value: string) {
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

export function formatRelativeDate(value: string | number | Date) {
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function formatUtcDateTime(value: string | number | Date) {
  return `${utcDateTime.format(new Date(value))} UTC`;
}

export function formatEpoch(epoch: number) {
  return `#${epoch.toString().padStart(3, "0")}`;
}
