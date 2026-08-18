export type ToolboxCategory = "frontend" | "backend" | "mobile" | "apis" | "sysadmin" | "cloud" | "security" | "ai";

/**
 * Mock content: this file stands in for the CMS until `/cms` serves the real collections.
 *
 * Only the structure lives here — ids, category, stack and links. Every string a visitor reads is
 * in the `projects` namespace under `featured.<id>` / `secondary.<id>`, so the site stays bilingual
 * while the copy is still hardcoded. Technology names stay here because they are proper nouns and
 * read the same in both languages.
 */
export type FeaturedProject = {
  id: string;
  category: "landing" | "mobile" | "webapp" | "api";
  technologies: string[];
  toolbox: ToolboxCategory[];
  href: string;
  media?: string;
};

export type SecondaryProject = {
  id: string;
  href: string;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "mi-utem",
    category: "mobile",
    technologies: ["Flutter", "Dart", "Firebase", "Fastlane", "Kotlin", "Swift", "CI/CD"],
    toolbox: ["mobile", "apis"],
    href: "https://github.com/exdevutem/mi-utem",
  },
  {
    id: "oktobeer",
    category: "landing",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    toolbox: ["frontend"],
    href: "https://oktobeer.franciscosolis.cl",
  },
  {
    id: "portfolio",
    category: "webapp",
    technologies: ["React", "TypeScript", "Vite.js", "Tailwind CSS", "Hono.dev", "Cloudflare Workers", "D1", "R2"],
    toolbox: ["frontend", "backend", "apis", "cloud"],
    href: "https://github.com/Im-Fran/franciscosolis.cl",
  },
  {
    id: "craftaro",
    category: "api",
    technologies: ["Laravel", "React", "Tailwind CSS", "PostgreSQL", "Redis", "Stripe", "REST APIs"],
    toolbox: ["backend", "apis", "sysadmin", "frontend"],
    href: "https://craftaro.com",
  },
];

export const getFeaturedProjectsByToolbox = (category: ToolboxCategory): FeaturedProject[] =>
  featuredProjects.filter((project) => project.toolbox.includes(category));

export const secondaryProjects: SecondaryProject[] = [
  {id: "rubybox", href: "https://github.com/Im-Fran/rubybox.cl"},
  {id: "sonatype-central-upload", href: "https://github.com/Im-Fran/SonatypeCentralUpload"},
];
