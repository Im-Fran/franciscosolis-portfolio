import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {ArrowUpRight} from "lucide-react";

const Projects = () => {

  const projects = [
    {
      title: "Portfolio",
      description: "A website to showcase my work, experience and skills.",
      links: [
        {label: "View on GitHub", href: "https://github.com/Im-Fran/franciscosolis-portfolio", variant: "outline"},
        {label: "View Live", href: "https://franciscosolis.cl", variant: "defaultOutline"},
      ],
    },
    {
      title: "RubyBox",
      description: "A Laravel Backend and ViteJS Frontend project to manage the inventory and a business dashboard.",
      links: [
        {label: "View on GitHub", href: "https://github.com/Im-Fran/rubybox.cl", variant: "outline"},
      ],
    },
    {
      title: "Mi UTEM",
      description: "A mobile app for the Universidad Tecnológica Metropolitana (UTEM) students.",
      links: [
        {label: "View on GitHub", href: "https://github.com/exdevutem/mi-utem", variant: "outline"},
      ],
    },
    {
      title: "SonatypeCentralUpload",
      description: "A Gradle plugin to upload artifacts to Sonatype Central.",
      links: [
        {label: "View on GitHub", href: "https://github.com/Im-Fran/SonatypeCentralUpload", variant: "outline"},
      ]
    },
    {
      title: "More Projects",
      description: "Check out more projects on my GitHub profile.",
      links: [
        {label: "Visit on GitHub", href: "https://github.com/Im-Fran/", variant: "outline"}
      ],
    }
  ]

  return <section className={"flex flex-col items-start justify-center gap-4"}>
    <div className={"flex flex-col items-start justify-center"}>
      <h2 className={"text-2xl font-semibold"}>Projects</h2>
      <h4 className={"text-md text-neutral-500 dark:text-neutral-400"}>Here are some of the projects I've worked on.</h4>
    </div>

    <div className={"grid grid-cols-2 md:grid-cols-2 gap-4"}>
      {projects.map((project, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardFooter className={"gap-5"}>
            {project.links.map(link => <Button variant={link.variant === 'outline' ? 'outline' : (link.variant === 'defaultOutline' ? 'defaultOutline' : 'default')} asChild>
              <a className={"flex items-center justify-center gap-0.5"} href={link.href} target="_blank"
                 rel="noopener noreferrer">
                {link.label}
                <ArrowUpRight size={16}/>
              </a>
            </Button>)}
          </CardFooter>
        </Card>
      ))}
    </div>
  </section>;
}

export default Projects;