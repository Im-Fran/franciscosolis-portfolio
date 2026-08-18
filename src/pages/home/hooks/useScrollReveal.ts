import {useLayoutEffect, type RefObject} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useA11y} from "@/lib/a11y";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades sections in as they come into view.
 *
 * GSAP writes inline styles rather than CSS, so the blanket reduced-motion rule in main.css
 * cannot reach these tweens — the hook has to opt out itself. Skipping the setup is also the
 * correct fallback: the markup is already in its final state, so everything is simply visible.
 */
export const useScrollReveal = (scope: RefObject<HTMLElement | null>) => {
  const {motion} = useA11y();

  useLayoutEffect(() => {
    if (!scope.current || motion === "reduced") return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-stagger").forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>(".reveal-item");
        if (items.length === 0) return;
        gsap.from(items, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: group,
            start: "top 80%",
          },
        });
      });
    }, scope);

    return () => ctx.revert();
  }, [scope, motion]);
};
