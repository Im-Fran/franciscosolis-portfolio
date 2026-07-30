import {useRef} from "react";
import {useTranslation} from "react-i18next";
import {ArrowUpRight, Code} from "@phosphor-icons/react";
import {ProjectCard} from "@/pages/home/components/projects/project-card.tsx";
import {featuredProjects, secondaryProjects} from "@/pages/home/components/projects/projects.data.ts";
import {Card, CardBody, CardTitle} from "@/components/ui/card.tsx";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

export const Projects = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section id="proyectos" ref={sectionRef} className="container mx-auto px-4 py-24">
      <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
        {t("projects:kicker")}
      </p>
      <h2 className="reveal text-[clamp(30px,4vw,46px)] text-text mb-10">
        {t("projects:title")}
      </h2>

      <div className="reveal-stagger grid items-stretch gap-6" style={{gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))"}}>
        {featuredProjects.map((project) => <ProjectCard key={project.id} {...project} />)}
      </div>

      <div className="reveal-stagger mt-8 grid gap-6" style={{gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"}}>
        {secondaryProjects.map((project) => (
          <a key={project.id} href={project.href} target="_blank" rel="noreferrer" data-fs-hover>
            <Card elevation="sm" className="reveal-item fs-hoverable h-full">
              <CardBody>
                <Code size={22} className="text-accent-300 mb-3"/>
                <CardTitle className="text-base">{project.title}</CardTitle>
                <p className="mt-2 text-sm text-neutral-400">{project.description}</p>
              </CardBody>
            </Card>
          </a>
        ))}

        <a href="https://github.com/Im-Fran" target="_blank" rel="noreferrer" data-fs-hover>
          <Card elevation="sm" className="reveal-item fs-hoverable h-full border border-accent-700">
            <CardBody className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-sm text-accent-300 inline-flex items-center gap-1">
                {t("projects:view_all")} <ArrowUpRight size={14}/>
              </span>
            </CardBody>
          </Card>
        </a>
      </div>
    </section>
  );
};
