import {useRef} from "react";
import {createPortal} from "react-dom";
import {useCustomCursor} from "@/pages/home/hooks/useCustomCursor.ts";
import {useA11y} from "@/lib/a11y";

/*
 * Rendered straight into <body> and promoted to the top layer, so neither a nested stacking
 * context nor a native <dialog> modal can end up painting over the drop.
 *
 * Two accessibility preferences reach in here: turning the drop off hands the pointer back to the
 * OS entirely, and reducing motion keeps the drop but drops its spring, stretch and lean.
 */
export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const uprightRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const {dropCursorEnabled, motion} = useA11y();

  useCustomCursor(dotRef, lensRef, uprightRef, glareRef, {
    enabled: dropCursorEnabled,
    reduceMotion: motion === "reduced",
  });

  if (typeof document === "undefined" || !dropCursorEnabled) return null;

  return createPortal(<>
    <div ref={dotRef} aria-hidden popover="manual" className="fs-cursor-layer pointer-events-none fixed top-0 left-0 z-[2147483647] size-1.5 rounded-full bg-accent hidden [body.fs-cursor-active_&]:block"/>
    <div ref={lensRef} aria-hidden popover="manual" className="fs-cursor-layer fs-lens pointer-events-none fixed top-0 left-0 z-[2147483647] hidden [body.fs-cursor-active_&]:block">
      <div className="fs-lens-content">
        <div ref={uprightRef} className="fs-lens-upright"/>
        <div ref={glareRef} className="fs-lens-glare"/>
      </div>
      <div className="fs-lens-refraction"/>
      <div className="fs-lens-sheen"/>
    </div>
  </>, document.body);
};
