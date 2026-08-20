export type ChartColorClass = string;

export const portfolioDistributionColors = [
  "bg-accent",
  "bg-category-blue",
  "bg-category-green",
] as const;

export function sumNumericArray(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function getPositionLeft(
  value: number | undefined,
  maxValue: number,
): number {
  if (!maxValue || value === undefined) return 0;
  return (value / maxValue) * 100;
}

export function getMarkerBgColor(
  marker: number | undefined,
  values: readonly number[],
  colors: readonly ChartColorClass[],
): ChartColorClass {
  if (marker === undefined) return colors[colors.length - 1] ?? "bg-subtle";

  if (marker <= 0) {
    for (let index = 0; index < values.length; index += 1) {
      if ((values[index] ?? 0) > 0) return colors[index] ?? "bg-subtle";
    }
  }

  let prefixSum = 0;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index] ?? 0;
    prefixSum += value;
    if (prefixSum >= marker) return colors[index] ?? "bg-subtle";
  }

  return colors[values.length - 1] ?? "bg-subtle";
}

export function formatDistributionLabel(value: number, maxValue: number): string {
  if (maxValue === 10_000) {
    return `${Math.round(value / 100)}%`;
  }
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(1);
}
