import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {ArrowUpRight} from "lucide-react";
import {i18n} from "@/translations/translations.ts";
import {Key, useEffect, useState} from "react";

const Projects = () => {

  const [projects, setProjects] = useState<{
    title: string | null | undefined;
    description: string | null | undefined;
    values: Project[] | null | undefined;
  }>(i18n.translations[i18n.locale].projects)

  useEffect(() => i18n.onChange(() => setProjects(i18n.translations[i18n.locale].projects)), [])

  return <section className={"flex flex-col items-start justify-center gap-4 md:w-full"}>
    <div className={"flex flex-col items-start justify-center"}>
      <h2 className={"text-2xl font-semibold"}>{projects.title}</h2>
      <h4 className={"text-md text-neutral-500 dark:text-neutral-400"}>{projects.description}</h4>
    </div>

    <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
      {projects.values?.map((project: Project, index: Key | null | undefined) => <Card
        key={index}>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardFooter className={"gap-5"}>
          {project.links?.map((link: Link) => <Button key={link.label} variant={link.variant === 'outline' ? 'outline' : (link.variant === 'defaultOutline' ? 'defaultOutline' : 'default')} asChild>
            <a className={"flex items-center justify-center gap-0.5"} href={link.href || '#'} target={"_blank"} rel={"noopener noreferrer"}>
              {link.label}
              <ArrowUpRight size={16}/>
            </a>
          </Button>)}
        </CardFooter>
      </Card>)}
    </div>
  </section>
}

interface Project {
  title: string | null | undefined;
  description: string | null | undefined;
  links: Link[] | null | undefined;
}

interface Link {
  label: string | null | undefined;
  href: string | null | undefined;
  variant: string | null | undefined;
}

export default Projects;