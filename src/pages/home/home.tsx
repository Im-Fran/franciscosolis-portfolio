import {GithubStats} from "@/pages/home/components/github-stats.tsx";
import {Hero} from "@/pages/home/components/hero.tsx";
import {Projects} from "@/pages/home/components/projects/projects.tsx";
import {Experience} from "@/pages/home/components/experience/experience.tsx";
import {Skills} from "@/pages/home/components/skills.tsx";

export const Home = () => <>
  <Hero/>
  <GithubStats/>
  <Projects/>
  <Skills/>
  <Experience/>
</>