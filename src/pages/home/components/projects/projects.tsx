import {Button} from "@/components/ui/button/button.tsx";
import type {Key} from "react";
import {ProjectCard} from "@/pages/home/components/projects/project-card.tsx";
import type {ProjectCardProps} from "@/pages/home/components/projects/project-card.tsx";
import {SiGithub} from "@icons-pack/react-simple-icons";
import {useTranslation} from "react-i18next";

export const Projects = () => {
  const {t} = useTranslation()

  return <section className="py-16 px-2.5">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">{t('projects:title')}</h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">{t('projects:description')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(t('projects:values', {returnObjects: true}) as ProjectCardProps[])?.map((project: ProjectCardProps, index: Key | null | undefined) => (
          <ProjectCard
            key={`project_${index}`}
            title={project.title || ''}
            description={project.description || ''}
            technologies={project.technologies || []}
            links={project.links || []}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={() => window.open('https://github.com/Im-Fran', '_blank')}
          variant="outline"
          className="gap-2 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <SiGithub size={16}/>
          {t('view_github_profile')}
        </Button>
      </div>
    </div>
  </section>
}