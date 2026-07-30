import {useLayoutEffect, type RefObject} from "react";
import gsap from "gsap";

export const useCustomCursor = (
  dotRef: RefObject<HTMLDivElement | null>,
  ringRef: RefObject<HTMLDivElement | null>,
) => {
  useLayoutEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    const moveDot = gsap.quickTo(dot, "x", {duration: 0.1, ease: "power3"});
    const moveDotY = gsap.quickTo(dot, "y", {duration: 0.1, ease: "power3"});
    const moveRing = gsap.quickTo(ring, "x", {duration: 0.35, ease: "power3"});
    const moveRingY = gsap.quickTo(ring, "y", {duration: 0.35, ease: "power3"});

    const onMove = (e: MouseEvent) => {
      moveDot(e.clientX);
      moveDotY(e.clientY);
      moveRing(e.clientX);
      moveRingY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [data-fs-hover]");
      if (target) gsap.to(ring, {scale: 1.8, duration: 0.3});
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [data-fs-hover]");
      if (target) gsap.to(ring, {scale: 1, duration: 0.3});
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.body.classList.add("fs-cursor-active");

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.classList.remove("fs-cursor-active");
    };
  }, [dotRef, ringRef]);
};
