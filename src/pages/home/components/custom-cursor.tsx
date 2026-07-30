import {useRef} from "react";
import {useCustomCursor} from "@/pages/home/hooks/useCustomCursor.ts";

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useCustomCursor(dotRef, ringRef);

  return <>
    <div ref={dotRef} className="pointer-events-none fixed top-0 left-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent hidden [body.fs-cursor-active_&]:block"/>
    <div ref={ringRef} className="pointer-events-none fixed top-0 left-0 z-[9999] h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-300 hidden [body.fs-cursor-active_&]:block"/>
  </>
};
