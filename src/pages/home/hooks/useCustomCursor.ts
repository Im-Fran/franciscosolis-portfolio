import {useLayoutEffect, type RefObject} from "react";
import gsap from "gsap";

const HOVER_SELECTOR = "a, button, [data-fs-hover]";

/** Idle ring diameter, in px. */
const IDLE_SIZE = 34;
/** Lens diameter while magnifying, in px. */
const LENS_SIZE = 104;
/** How much the content under the lens is scaled up. */
const MAGNIFICATION = 1.75;
/** Targets bigger than this (in px²) get the glass, but no magnified copy. */
const MAX_CLONE_AREA = 1_400_000;

/* Inherited properties the clone cannot resolve on its own (they come from ancestors). */
const INHERITED_PROPS = [
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "letter-spacing",
  "line-height",
  "text-align",
  "text-transform",
  "white-space",
] as const;

const buildClone = (source: HTMLElement) => {
  const clone = source.cloneNode(true) as HTMLElement;

  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  clone.setAttribute("aria-hidden", "true");
  clone.classList.add("fs-lens-clone");

  const computed = getComputedStyle(source);
  INHERITED_PROPS.forEach((prop) => clone.style.setProperty(prop, computed.getPropertyValue(prop)));

  clone.style.position = "absolute";
  clone.style.margin = "0";
  clone.style.maxWidth = "none";
  clone.style.maxHeight = "none";
  clone.style.pointerEvents = "none";
  clone.style.willChange = "transform";

  return clone;
};

export const useCustomCursor = (
  dotRef: RefObject<HTMLDivElement | null>,
  lensRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
) => {
  useLayoutEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!dotRef.current || !lensRef.current || !contentRef.current) return;

    const dot = dotRef.current;
    const lens = lensRef.current;
    const content = contentRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set([dot, lens], {xPercent: -50, yPercent: -50, x: -200, y: -200});
    gsap.set(lens, {width: IDLE_SIZE, height: IDLE_SIZE});

    const moveDotX = gsap.quickTo(dot, "x", {duration: 0.1, ease: "power3"});
    const moveDotY = gsap.quickTo(dot, "y", {duration: 0.1, ease: "power3"});
    const moveLensX = gsap.quickTo(lens, "x", {duration: 0.35, ease: "power3"});
    const moveLensY = gsap.quickTo(lens, "y", {duration: 0.35, ease: "power3"});

    /* Animated through gsap so the lens can grow and focus with a single elastic tween. */
    const lensState = {size: IDLE_SIZE, magnification: 1};

    let target: HTMLElement | null = null;
    let clone: HTMLElement | null = null;
    let lastSize = "";
    let syncing = false;

    /*
     * Keeps the magnified copy locked to whatever the lens is currently sitting on: the lens lags
     * behind the pointer, so the geometry is derived from the lens' own animated position, not from
     * the raw cursor coordinates.
     */
    const sync = () => {
      const size = `${lensState.size}px`;
      if (size !== lastSize) {
        lens.style.width = size;
        lens.style.height = size;
        lastSize = size;
      }

      if (!clone || !target) return;
      /* The hovered element can disappear under the cursor (carousels, modals, route changes). */
      if (!target.isConnected) {
        release();
        return;
      }

      const rect = target.getBoundingClientRect();
      const lensX = gsap.getProperty(lens, "x") as number;
      const lensY = gsap.getProperty(lens, "y") as number;
      /* Point of the target that has to stay pinned to the centre of the lens. */
      const focusX = lensX - rect.left;
      const focusY = lensY - rect.top;
      const radius = lensState.size / 2;

      clone.style.left = `${radius - focusX}px`;
      clone.style.top = `${radius - focusY}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.transformOrigin = `${focusX}px ${focusY}px`;
      clone.style.transform = `scale(${lensState.magnification})`;
    };

    const startSync = () => {
      if (syncing) return;
      gsap.ticker.add(sync);
      syncing = true;
    };

    const stopSync = () => {
      if (!syncing) return;
      gsap.ticker.remove(sync);
      syncing = false;
    };

    const magnify = (element: HTMLElement) => {
      target = element;
      const rect = element.getBoundingClientRect();

      content.replaceChildren();
      clone = rect.width * rect.height <= MAX_CLONE_AREA ? buildClone(element) : null;
      if (clone) content.appendChild(clone);

      lens.classList.add("is-magnifying");
      gsap.killTweensOf(lensState);
      gsap.to(lensState, {
        size: LENS_SIZE,
        magnification: MAGNIFICATION,
        duration: reduceMotion ? 0.2 : 0.55,
        ease: reduceMotion ? "power2.out" : "elastic.out(1, 0.72)",
      });
      gsap.to(dot, {opacity: 0, scale: 0.4, duration: 0.25, ease: "power2.out"});
      startSync();
      sync();
    };

    const release = () => {
      target = null;
      lens.classList.remove("is-magnifying");
      gsap.killTweensOf(lensState);
      gsap.to(lensState, {
        size: IDLE_SIZE,
        magnification: 1,
        duration: reduceMotion ? 0.15 : 0.35,
        ease: "power3.out",
        onComplete: () => {
          content.replaceChildren();
          clone = null;
          stopSync();
        },
      });
      gsap.to(dot, {opacity: 1, scale: 1, duration: 0.25, ease: "power2.out"});
    };

    const onMove = (e: MouseEvent) => {
      moveDotX(e.clientX);
      moveDotY(e.clientY);
      moveLensX(e.clientX);
      moveLensY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const next = (e.target as HTMLElement | null)?.closest<HTMLElement>(HOVER_SELECTOR) ?? null;
      if (next === target) return;
      if (next) magnify(next);
      else release();
    };

    const onLeave = () => {
      if (target) release();
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    document.body.classList.add("fs-cursor-active");

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("fs-cursor-active");
      gsap.killTweensOf([lensState, dot, lens]);
      stopSync();
      content.replaceChildren();
    };
  }, [dotRef, lensRef, contentRef]);
};
