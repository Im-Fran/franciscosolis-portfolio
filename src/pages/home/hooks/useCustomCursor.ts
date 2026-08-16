import {useLayoutEffect, type RefObject} from "react";
import gsap from "gsap";

const HOVER_SELECTOR = "a, button, [data-fs-hover]";
/** Elements that get promoted to the top layer, where plain z-index no longer applies. */
const TOP_LAYER_SELECTOR = "dialog[open], [popover]";

/** Resting droplet diameter, in px. */
const IDLE_SIZE = 30;
/** Droplet diameter while magnifying, in px. */
const LENS_SIZE = 104;
/** How much the content under the droplet is scaled up. */
const MAGNIFICATION = 1.75;
/** Targets bigger than this (in px²) get the glass, but no magnified copy. */
const MAX_CLONE_AREA = 1_400_000;

/*
 * Droplet physics. The drop stretches along its direction of travel and springs back into a bead
 * once it settles, which is what reads as liquid rather than as a moving circle.
 */
const STRETCH_IDLE = 0.34;
const STRETCH_MAGNIFYING = 0.16;
/** Speed (px/s) at which the drop reaches its full stretch. */
const SPEED_FOR_MAX_STRETCH = 2600;
const SPRING_STIFFNESS = 210;
const SPRING_DAMPING = 15;
/** Below this speed (px/s) the drop keeps its last orientation instead of chasing noise. */
const MIN_SPEED_FOR_ANGLE = 40;

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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Moves an angle towards another one the short way around, so 350° → 10° does not spin backwards. */
const approachAngle = (current: number, goal: number, ratio: number) =>
  current + (((goal - current + 540) % 360) - 180) * ratio;

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
  uprightRef: RefObject<HTMLDivElement | null>,
  glareRef: RefObject<HTMLDivElement | null>,
) => {
  useLayoutEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!dotRef.current || !lensRef.current) return;
    if (!uprightRef.current || !glareRef.current) return;

    const dot = dotRef.current;
    const lens = lensRef.current;
    const upright = uprightRef.current;
    const glare = glareRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set([dot, lens], {xPercent: -50, yPercent: -50, x: -200, y: -200});
    gsap.set(lens, {width: IDLE_SIZE, height: IDLE_SIZE});

    const moveDotX = gsap.quickTo(dot, "x", {duration: 0.1, ease: "power3"});
    const moveDotY = gsap.quickTo(dot, "y", {duration: 0.1, ease: "power3"});
    const moveLensX = gsap.quickTo(lens, "x", {duration: 0.35, ease: "power3"});
    const moveLensY = gsap.quickTo(lens, "y", {duration: 0.35, ease: "power3"});
    const setRotation = gsap.quickSetter(lens, "rotation", "deg") as (value: number) => void;
    const setScaleX = gsap.quickSetter(lens, "scaleX") as (value: number) => void;
    const setScaleY = gsap.quickSetter(lens, "scaleY") as (value: number) => void;

    /* Animated through gsap so the drop can swell into the lens with a single elastic tween. */
    const lensState = {size: IDLE_SIZE, magnification: 1, glass: 0};

    let target: HTMLElement | null = null;
    let clone: HTMLElement | null = null;
    let lastSize = "";
    let lastSpin = "";

    /* Spring state of the droplet, driven by how fast the drop itself is travelling. */
    let previousX = -200;
    let previousY = -200;
    let stretch = 0;
    let stretchVelocity = 0;
    let angle = 0;

    /*
     * Deforms the drop, then keeps the magnified copy locked to whatever the lens is sitting on:
     * the lens lags behind the pointer, so the geometry is derived from the lens' own animated
     * position rather than from the raw cursor coordinates.
     */
    const frame = (_time: number, delta: number) => {
      /* Clamped so a backgrounded tab does not resume with one enormous step. */
      const step = Math.min(delta, 34) / 1000;
      const lensX = gsap.getProperty(lens, "x") as number;
      const lensY = gsap.getProperty(lens, "y") as number;
      const travelX = lensX - previousX;
      const travelY = lensY - previousY;
      previousX = lensX;
      previousY = lensY;

      if (!reduceMotion && step > 0) {
        const speed = Math.hypot(travelX, travelY) / step;

        if (speed > MIN_SPEED_FOR_ANGLE) {
          const heading = (Math.atan2(travelY, travelX) * 180) / Math.PI;
          angle = approachAngle(angle, heading, Math.min(1, step * 18));
        }

        const limit = target ? STRETCH_MAGNIFYING : STRETCH_IDLE;
        const goal = Math.min(speed / SPEED_FOR_MAX_STRETCH, 1) * limit;
        stretchVelocity += ((goal - stretch) * SPRING_STIFFNESS - stretchVelocity * SPRING_DAMPING) * step;
        stretch = clamp(stretch + stretchVelocity * step, -0.25, 0.6);

        /* Stretching along the heading while squeezing across it keeps the volume believable. */
        setRotation(angle);
        setScaleX(1 + stretch);
        setScaleY(1 / (1 + stretch));

        const spin = `rotate(${-angle}deg)`;
        if (spin !== lastSpin) {
          /* The clone and the specular stay world-upright while the drop itself leans into the move. */
          upright.style.transform = spin;
          glare.style.transform = spin;
          lastSpin = spin;
        }
      }

      const pull = clamp(stretch / STRETCH_IDLE, 0, 1);
      /* The trailing edge sharpens into a tail as the drop picks up speed. */
      lens.style.setProperty("--fs-drop-tail", `${50 - pull * (target ? 12 : 30)}%`);
      lens.style.setProperty("--fs-glass", `${Math.max(0, lensState.glass)}`);
      lens.style.setProperty("--fs-shine", `${clamp(0.3 + lensState.glass * 0.45 + pull * 0.25, 0, 1)}`);

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

    const magnify = (element: HTMLElement) => {
      target = element;
      const rect = element.getBoundingClientRect();

      upright.replaceChildren();
      clone = rect.width * rect.height <= MAX_CLONE_AREA ? buildClone(element) : null;
      if (clone) upright.appendChild(clone);

      lens.classList.add("is-magnifying");
      gsap.killTweensOf(lensState);
      gsap.to(lensState, {
        size: LENS_SIZE,
        magnification: MAGNIFICATION,
        glass: 1,
        duration: reduceMotion ? 0.2 : 0.55,
        ease: reduceMotion ? "power2.out" : "elastic.out(1, 0.72)",
      });
      gsap.to(dot, {opacity: 0, scale: 0.4, duration: 0.25, ease: "power2.out"});
    };

    const release = () => {
      target = null;
      lens.classList.remove("is-magnifying");
      gsap.killTweensOf(lensState);
      gsap.to(lensState, {
        size: IDLE_SIZE,
        magnification: 1,
        glass: 0,
        duration: reduceMotion ? 0.15 : 0.35,
        ease: "power3.out",
        onComplete: () => {
          upright.replaceChildren();
          clone = null;
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

    /*
     * The top layer is ordered by promotion, not by z-index, so the drop has to re-enter it every
     * time something else joins — otherwise a modal <dialog> opened later paints over it.
     */
    const promote = () => {
      [dot, lens].forEach((layer) => {
        if (typeof layer.showPopover !== "function") return;
        try {
          if (layer.matches(":popover-open")) layer.hidePopover();
          layer.showPopover();
        } catch {
          /* Browsers without the popover API fall back to plain z-index stacking. */
        }
      });
    };

    const joinsTopLayer = (node: Node) =>
      node instanceof HTMLElement && (node.matches(TOP_LAYER_SELECTOR) || node.querySelector(TOP_LAYER_SELECTOR) !== null);

    const topLayerWatcher = new MutationObserver((records) => {
      const joined = records.some((record) =>
        record.type === "attributes"
          ? record.target instanceof HTMLElement && record.target.matches(TOP_LAYER_SELECTOR)
          : Array.from(record.addedNodes).some(joinsTopLayer),
      );
      if (joined) promote();
    });

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    document.body.classList.add("fs-cursor-active");
    gsap.ticker.add(frame);
    promote();
    topLayerWatcher.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open", "popover"],
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("fs-cursor-active");
      topLayerWatcher.disconnect();
      gsap.ticker.remove(frame);
      gsap.killTweensOf([lensState, dot, lens]);
      upright.replaceChildren();
    };
  }, [dotRef, lensRef, uprightRef, glareRef]);
};
