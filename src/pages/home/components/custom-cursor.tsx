import {useRef} from "react";
import {useCustomCursor} from "@/pages/home/hooks/useCustomCursor.ts";

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const uprightRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useCustomCursor(dotRef, lensRef, uprightRef, glareRef);

  return <>
    <div ref={dotRef} aria-hidden className="pointer-events-none fixed top-0 left-0 z-9999 size-1.5 rounded-full bg-accent hidden [body.fs-cursor-active_&]:block"/>
    <div ref={lensRef} aria-hidden className="fs-lens pointer-events-none fixed top-0 left-0 z-9999 hidden [body.fs-cursor-active_&]:block">
      <div className="fs-lens-content">
        <div ref={uprightRef} className="fs-lens-upright"/>
        <div ref={glareRef} className="fs-lens-glare"/>
      </div>
      <div className="fs-lens-refraction"/>
      <div className="fs-lens-sheen"/>
    </div>
  </>
};
