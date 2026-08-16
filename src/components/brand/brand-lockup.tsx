import type {HTMLAttributes} from "react";
import {cn} from "@/lib/utils.ts";
import {BRAND_MARK_MIN_SIZE, BrandMark} from "@/components/brand/brand-mark.tsx";

/**
 * Lockup proportions, expressed as ratios of the mark's height so the lockup scales as one unit.
 * Values are read off the reference SVGs in public/brand/.
 */
const HORIZONTAL_FONT_RATIO = 0.594;
const HORIZONTAL_GAP_RATIO = 0.281;
const STACKED_FONT_RATIO = 0.375;
const STACKED_GAP_RATIO = 0.5;
/** Clear space is half the mark's height on every side. */
const CLEAR_SPACE_RATIO = 0.5;

export type BrandLockupProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Mark edge length in px; the wordmark scales with it. */
  size?: number;
  /** `dark` is the variant for dark surfaces, where "Francisco" lightens and "Solis" goes white. */
  tone?: "light" | "dark";
  variant?: "horizontal" | "stacked";
  /**
   * Reserve the brand's clear space (half the mark's height) as padding. Leave off where the
   * surrounding layout already provides at least that much room, so the gap is not counted twice.
   */
  clearSpace?: boolean;
};

/**
 * The full FranciscoSolis lockup: mark plus wordmark, set as one name.
 *
 * The wordmark is real text in Sora rather than the `<text>` baked into the reference SVGs — those
 * resolve Sora against locally installed fonts only and fall back to a system sans on most machines.
 * Rendering it here keeps the name selectable, crisp at any size, and readable to screen readers.
 */
export const BrandLockup = ({
  size = 32,
  tone = "dark",
  variant = "horizontal",
  clearSpace = false,
  className,
  ...rest
}: BrandLockupProps) => {
  const edge = Math.max(size, BRAND_MARK_MIN_SIZE);
  const stacked = variant === "stacked";
  const fontSize = edge * (stacked ? STACKED_FONT_RATIO : HORIZONTAL_FONT_RATIO);
  const gap = edge * (stacked ? STACKED_GAP_RATIO : HORIZONTAL_GAP_RATIO);

  return (
    <span
      className={cn(
        "inline-flex select-none",
        stacked ? "flex-col items-center text-center" : "flex-row items-center",
        className,
      )}
      style={{
        gap: `${gap}px`,
        padding: clearSpace ? `${edge * CLEAR_SPACE_RATIO}px` : undefined,
      }}
      {...rest}
    >
      <BrandMark size={edge} decorative/>
      <span
        className="font-display font-semibold leading-none whitespace-nowrap"
        style={{fontSize: `${fontSize}px`, letterSpacing: "-0.02em"}}
      >
        <span style={{color: tone === "dark" ? "var(--color-brand-on-dark)" : "var(--color-brand)"}}>
          Francisco
        </span>
        <span style={{color: tone === "dark" ? "#fff" : "var(--color-brand-ink)"}}>
          Solis
        </span>
      </span>
    </span>
  );
};
