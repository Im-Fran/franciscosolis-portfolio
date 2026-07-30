import {useLayoutEffect, type RefObject} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollReveal = (scope: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    if (!scope.current) return;

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
          y: 40,
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
  }, [scope]);
};
