"use client";

import {
  useMemo,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  formatDistributionLabel,
  getMarkerBgColor,
  getPositionLeft,
  portfolioDistributionColors,
  sumNumericArray,
  type ChartColorClass,
} from "@/lib/chart-utils";
import { cn } from "@/lib/cn";
import { typographyVariants } from "./typography";
import { Tooltip } from "./tooltip";

function BarLabels({
  values,
  maxValue,
}: {
  values: readonly number[];
  maxValue: number;
}) {
  let prefixSum = 0;
  let hiddenSum = 0;

  return (
    <div
      className={cn(
        typographyVariants.caption,
        "relative mb-2 flex h-4 w-full font-medium text-subtle",
      )}
    >
      <div className="absolute bottom-0 left-0">0%</div>
      {values.map((value, index) => {
        prefixSum += value;
        const showLabel =
          (value >= 0.1 * maxValue || hiddenSum >= 0.09 * maxValue) &&
          maxValue - prefixSum >= 0.1 * maxValue &&
          prefixSum >= 0.1 * maxValue &&
          prefixSum < 0.9 * maxValue;

        hiddenSum = showLabel ? 0 : hiddenSum + value;
        const width = getPositionLeft(value, maxValue);

        return (
          <div
            className="flex items-center justify-end pr-0.5"
            key={`label-${index}`}
            style={{ width: `${width}%` }}
          >
            {showLabel ? (
              <span className="block translate-x-1/2 tabular-nums">
                {formatDistributionLabel(prefixSum, maxValue)}
              </span>
            ) : null}
          </div>
        );
      })}
      <div className="absolute right-0 bottom-0 tabular-nums">
        {formatDistributionLabel(maxValue, maxValue)}
      </div>
    </div>
  );
}

export type CategoryBarProps = ComponentProps<"div"> & {
  values: readonly number[];
  colors?: readonly ChartColorClass[];
  marker?: { value: number; tooltip?: string; showAnimation?: boolean };
  showLabels?: boolean;
};

export function CategoryBar({
  values,
  colors = portfolioDistributionColors,
  marker,
  showLabels = true,
  className,
  ...props
}: CategoryBarProps) {
  const maxValue = useMemo(() => sumNumericArray(values), [values]);
  const markerBgColor = useMemo(
    () => getMarkerBgColor(marker?.value, values, colors),
    [marker, values, colors],
  );

  const adjustedMarkerValue = useMemo(() => {
    if (marker === undefined) return undefined;
    if (marker.value < 0) return 0;
    if (marker.value > maxValue) return maxValue;
    return marker.value;
  }, [marker, maxValue]);

  const markerPositionLeft = useMemo(
    () => getPositionLeft(adjustedMarkerValue, maxValue),
    [adjustedMarkerValue, maxValue],
  );

  return (
    <div
      aria-label="Category bar"
      aria-valuemax={maxValue}
      aria-valuemin={0}
      aria-valuenow={marker?.value ?? maxValue}
      className={cn(className)}
      role="group"
      {...props}
    >
      {showLabels && maxValue > 0 ? (
        <BarLabels maxValue={maxValue} values={values} />
      ) : null}
      <div className="relative flex h-2 w-full items-center">
        <div className="flex h-full flex-1 items-center gap-0.5 overflow-hidden rounded-full bg-soft">
          {values.map((value, index) => {
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            return (
              <div
                className={cn(
                  "h-full",
                  colors[index] ?? "bg-subtle",
                  percentage === 0 && "hidden",
                )}
                key={`segment-${index}`}
                style={{ width: `${percentage}%` }}
              />
            );
          })}
        </div>

        {marker !== undefined ? (
          <div
            className={cn(
              "absolute w-2 -translate-x-1/2",
              marker.showAnimation &&
                "transform-gpu transition-[left] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            )}
            style={{ left: `${markerPositionLeft}%` }}
          >
            {marker.tooltip ? (
              <Tooltip
                content={marker.tooltip}
                trigger={
                  <div
                    aria-hidden="true"
                    className={cn(
                      "relative mx-auto h-4 w-1 rounded-full ring-2 ring-surface",
                      markerBgColor,
                    )}
                  />
                }
              />
            ) : (
              <div
                className={cn(
                  "mx-auto h-4 w-1 rounded-full ring-2 ring-surface",
                  markerBgColor,
                )}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type DistributionSegment = {
  label: ReactNode;
  value: number;
  colorClassName: ChartColorClass;
  detail?: ReactNode;
};

export function DistributionBar({
  segments,
  className,
  showScaleLabels = true,
  marker,
}: {
  segments: readonly DistributionSegment[];
  className?: string;
  showScaleLabels?: boolean;
  marker?: CategoryBarProps["marker"];
}) {
  return (
    <div className={cn("grid gap-3", className)}>
      <CategoryBar
        colors={segments.map((segment) => segment.colorClassName)}
        showLabels={showScaleLabels}
        values={segments.map((segment) => segment.value)}
        {...(marker ? { marker } : {})}
      />
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((segment) => (
          <TypographyLegend
            colorClassName={segment.colorClassName}
            detail={segment.detail}
            key={String(segment.label)}
            label={segment.label}
          />
        ))}
      </div>
    </div>
  );
}

function TypographyLegend({
  label,
  detail,
  colorClassName,
}: {
  label: ReactNode;
  detail?: ReactNode;
  colorClassName: string;
}) {
  return (
    <div className={cn(typographyVariants.ui, "flex items-center gap-2 text-muted")}>
      <span className={cn("size-2 rounded-full", colorClassName)} />
      {label}
      {detail ? <span className="text-subtle">{detail}</span> : null}
    </div>
  );
}
