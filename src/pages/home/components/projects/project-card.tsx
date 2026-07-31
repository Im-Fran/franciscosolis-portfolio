import {useState} from "react";
import {ArrowUpRight} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import {Card, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Modal} from "@/components/ui/modal.tsx";
import type {FeaturedProject} from "@/pages/home/components/projects/projects.data.ts";

export const ProjectCard = ({category, title, description, longDescription, technologies, toolbox, href, media}: FeaturedProject) => {
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card elevation="md" className="reveal-item fs-hoverable w-full flex-1 flex flex-col overflow-hidden p-0">
        <button type="button" data-fs-hover onClick={() => setOpen(true)} className="flex flex-1 flex-col w-full h-full text-left">
          <div className="h-[260px] w-full shrink-0 bg-neutral-900 flex items-center justify-center text-neutral-700 text-sm">
            {media ? <img src={media} alt={title} className="h-full w-full object-cover"/> : "GIF"}
          </div>
          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <Badge variant="accent" className="mb-3">{t(`projects:categories.${category}`)}</Badge>
              <CardTitle>{title}</CardTitle>
              <p className="mt-2 text-sm text-neutral-300 leading-[1.55]">{description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {technologies.map((tech) => <Badge key={tech} variant="outline">{tech}</Badge>)}
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent-300">
              {t("projects:view_project")} <ArrowUpRight size={14}/>
            </span>
          </div>
        </button>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="h-[200px] w-full overflow-hidden rounded-[var(--radius-sm)] bg-neutral-900 flex items-center justify-center text-neutral-700 text-sm">
          {media ? <img src={media} alt={title} className="h-full w-full object-cover"/> : "GIF"}
        </div>
        <Badge variant="accent" className="mt-4">{t(`projects:categories.${category}`)}</Badge>
        <p className="mt-3 text-sm leading-[1.6] text-neutral-300">{longDescription}</p>

        <p className="mt-4 text-xs uppercase tracking-[0.08em] text-neutral-500">{t("projects:skills_label")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {technologies.map((tech) => <Badge key={tech} variant="outline">{tech}</Badge>)}
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.08em] text-neutral-500">{t("projects:toolbox_label")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {toolbox.map((key) => <Badge key={key} variant="neutral">{t(`stack:categoryLabels.${key}`)}</Badge>)}
        </div>

        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          data-fs-hover
          className="mt-6 inline-flex items-center gap-1 text-sm text-accent-300"
        >
          {t("projects:view_project")} <ArrowUpRight size={14}/>
        </a>
      </Modal>
    </>
  );
};
