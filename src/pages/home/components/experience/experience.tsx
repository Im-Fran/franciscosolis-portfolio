import {useLayoutEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

gsap.registerPlugin(ScrollTrigger);

type Milestone = { label: string; title: string; description: string };

export const Experience = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef);

  const milestones = t("experience:milestones", {returnObjects: true}) as Milestone[];

  useLayoutEffect(() => {
    if (!timelineRef.current || !lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(lineRef.current, {scaleY: 0, transformOrigin: "top"});
      gsap.to(lineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 70%",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="experiencia" ref={sectionRef} className="container mx-auto px-4 py-24">
      <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
        {t("experience:kicker")}
      </p>
      <h2 className="reveal text-[clamp(30px,4vw,46px)] text-text mb-14">
        {t("experience:title")}
      </h2>

      <div ref={timelineRef} className="relative mx-auto max-w-[760px] pl-10">
        <div
          ref={lineRef}
          className="absolute left-2 top-0 bottom-0 w-px"
          style={{background: "linear-gradient(to bottom, var(--color-accent-600), var(--color-neutral-800))"}}
        />

        <div className="space-y-14">
          {milestones.map((milestone) => (
            <div key={milestone.label} className="reveal relative">
              <span className="absolute -left-10 top-1 h-3 w-3 rounded-full border border-accent-300 bg-bg"/>
              <p className="text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-1">{milestone.label}</p>
              <h3 className="text-lg text-text">{milestone.title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-neutral-300">{milestone.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
