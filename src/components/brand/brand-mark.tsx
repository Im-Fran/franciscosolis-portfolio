import type {SVGProps} from "react";
import {cn} from "@/lib/utils.ts";

/** Minimum legible size of the mark, per docs/BRAND.md. */
export const BRAND_MARK_MIN_SIZE = 16;

/** The mark is drawn on a 64×64 grid; every ratio below is expressed against it. */
const GRID = 64;
const TILE_RADIUS = 14;
/** Peak inset inside the blue tile. */
const TILE_PEAK = "M32 14 L50 50 H37.5 L32 39 L26.5 50 H14 Z";
/** Full-bleed peak used by the single-color ink mark. */
const MONO_PEAK = "M32 6 L58 58 H40.5 L32 41 L23.5 58 H6 Z";

export type BrandMarkProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "width" | "height" | "fill"> & {
  /** Rendered edge length in px. Clamped up to BRAND_MARK_MIN_SIZE. */
  size?: number;
  /** Single-color ink peak instead of the blue tile, for print and one-color contexts. */
  mono?: boolean;
  /** Set when the mark sits next to the wordmark, so the name is announced only once. */
  decorative?: boolean;
};

/**
 * The FranciscoSolis mark: a peak on a blue tile.
 *
 * The tile color is fixed by the brand and is deliberately not themeable — see the "Don'ts" in
 * docs/BRAND.md. Use `mono` for single-color surfaces rather than recoloring the tile.
 */
export const BrandMark = ({size = 32, mono = false, decorative = false, className, ...rest}: BrandMarkProps) => {
  const edge = Math.max(size, BRAND_MARK_MIN_SIZE);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${GRID} ${GRID}`}
      width={edge}
      height={edge}
      className={cn("shrink-0", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "FranciscoSolis"}
      {...rest}
    >
      {mono ? (
        <path d={MONO_PEAK} fill="var(--color-brand-ink)"/>
      ) : (
        <>
          <rect width={GRID} height={GRID} rx={TILE_RADIUS} fill="var(--color-brand)"/>
          <path d={TILE_PEAK} fill="#fff"/>
        </>
      )}
    </svg>
  );
};
