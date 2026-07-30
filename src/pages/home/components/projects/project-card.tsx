import {ArrowUpRight} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import {Card, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import type {FeaturedProject} from "@/pages/home/components/projects/projects.data.ts";

export const ProjectCard = ({category, title, description, technologies, href, media}: FeaturedProject) => {
  const {t} = useTranslation();

  return (
    <Card elevation="md" className="reveal-item fs-hoverable overflow-hidden p-0">
      <a href={href} target="_blank" rel="noreferrer" data-fs-hover className="block">
        <div className="h-[260px] w-full bg-neutral-900 flex items-center justify-center text-neutral-700 text-sm">
          {media ? <img src={media} alt={title} className="h-full w-full object-cover"/> : "GIF"}
        </div>
        <div className="p-6">
          <Badge variant="accent" className="mb-3">{t(`projects:categories.${category}`)}</Badge>
          <CardTitle>{title}</CardTitle>
          <p className="mt-2 text-sm text-neutral-300 leading-[1.55]">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {technologies.map((tech) => <Badge key={tech} variant="outline">{tech}</Badge>)}
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent-300">
            {t("projects:view_project")} <ArrowUpRight size={14}/>
          </span>
        </div>
      </a>
    </Card>
  );
};
