export type ToolboxCategory = "frontend" | "backend" | "mobile" | "apis" | "sysadmin" | "cloud" | "security";

export type FeaturedProject = {
  id: string;
  category: "landing" | "mobile" | "webapp" | "api";
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  toolbox: ToolboxCategory[];
  href: string;
  media?: string;
};

export type SecondaryProject = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "featured-1",
    category: "landing",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    longDescription: "Descripción detallada del proyecto: el problema que resuelve, el enfoque técnico y el resultado.",
    technologies: ["React", "Tailwind CSS"],
    toolbox: ["frontend"],
    href: "#",
  },
  {
    id: "featured-2",
    category: "mobile",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    longDescription: "Descripción detallada del proyecto: el problema que resuelve, el enfoque técnico y el resultado.",
    technologies: ["Kotlin", "Android"],
    toolbox: ["mobile"],
    href: "#",
  },
  {
    id: "featured-3",
    category: "webapp",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    longDescription: "Descripción detallada del proyecto: el problema que resuelve, el enfoque técnico y el resultado.",
    technologies: ["Next.js", "TypeScript"],
    toolbox: ["frontend", "apis"],
    href: "#",
  },
  {
    id: "featured-4",
    category: "api",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    longDescription: "Descripción detallada del proyecto: el problema que resuelve, el enfoque técnico y el resultado.",
    technologies: ["Node.js", "Docker"],
    toolbox: ["apis", "backend"],
    href: "#",
  },
];

export const getFeaturedProjectsByToolbox = (category: ToolboxCategory): FeaturedProject[] =>
  featuredProjects.filter((project) => project.toolbox.includes(category));

export const secondaryProjects: SecondaryProject[] = [
  {id: "secondary-1", title: "RubyBox", description: "Inventario y panel de control empresarial.", href: "https://github.com/Im-Fran/rubybox.cl"},
  {id: "secondary-2", title: "Mi UTEM", description: "App móvil para estudiantes UTEM.", href: "https://github.com/exdevutem/mi-utem"},
  {id: "secondary-3", title: "SonatypeCentralUpload", description: "Plugin Gradle para Sonatype Central.", href: "https://github.com/Im-Fran/SonatypeCentralUpload"},
];
