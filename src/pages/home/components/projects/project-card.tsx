import {Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button/button.tsx";
import {SiGithub} from "@icons-pack/react-simple-icons";
import {ExternalLink} from "lucide-react";
import {Badge} from "@/components/ui/badge/badge.tsx";

export type ProjectCardProps = {
  title: string;
  description: string;
  technologies: string[];
  links: ProjectCardLink[];
}

export type ProjectCardLink = {
  label: string | null | undefined;
  href: string | null | undefined;
  variant: string | null | undefined;
  icon?: string | null | undefined;
}

export const ProjectCard = ({ title, description, technologies = [], links }: ProjectCardProps) => <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm">
  <CardHeader>
    <CardTitle className="text-xl">{title}</CardTitle>
  </CardHeader>
  <CardContent>
    <CardDescription className="text-gray-400">{description}</CardDescription>
    <div className="flex flex-wrap gap-2 mt-4">
      {technologies.map((tag, index) => <Badge key={index} variant="secondary" className="bg-gray-300/50 dark:bg-blue-950/50">{tag}</Badge>)}
    </div>
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    {links.map((link, idx) => <Button key={idx} onClick={() => window.open(link.href || '#', '_blank')} size="sm" className="gap-1" variant={link.variant === 'outline' ? 'outline' : (link.variant === 'defaultOutline' ? 'defaultOutline' : 'default')}>
      {link.icon === 'github' && <SiGithub size={14}/>}
      {link.icon === 'external-link' && <ExternalLink size={14}/>}
      <span>{link.label}</span>
    </Button>)}
  </CardFooter>
</Card>