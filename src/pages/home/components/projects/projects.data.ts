export type FeaturedProject = {
  id: string;
  category: "landing" | "mobile" | "webapp" | "api";
  title: string;
  description: string;
  technologies: string[];
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
    technologies: ["React", "TailwindCSS"],
    href: "#",
  },
  {
    id: "featured-2",
    category: "mobile",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    technologies: ["Kotlin", "Android"],
    href: "#",
  },
  {
    id: "featured-3",
    category: "webapp",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    technologies: ["Next.js", "TypeScript"],
    href: "#",
  },
  {
    id: "featured-4",
    category: "api",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    technologies: ["Node.js", "Docker"],
    href: "#",
  },
];

export const secondaryProjects: SecondaryProject[] = [
  {id: "secondary-1", title: "RubyBox", description: "Inventario y panel de control empresarial.", href: "https://github.com/Im-Fran/rubybox.cl"},
  {id: "secondary-2", title: "Mi UTEM", description: "App móvil para estudiantes UTEM.", href: "https://github.com/exdevutem/mi-utem"},
  {id: "secondary-3", title: "SonatypeCentralUpload", description: "Plugin Gradle para Sonatype Central.", href: "https://github.com/Im-Fran/SonatypeCentralUpload"},
];
