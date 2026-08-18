import {Nav} from "@/pages/home/components/nav.tsx";
import {Hero} from "@/pages/home/components/hero.tsx";
import {Stack} from "@/pages/home/components/stack.tsx";
import {Projects} from "@/pages/home/components/projects/projects.tsx";
import {Experience} from "@/pages/home/components/experience/experience.tsx";
import {Contact} from "@/pages/home/components/contact.tsx";

export const Home = () => <>
  <Nav/>
  <Hero/>
  <Stack/>
  <Projects/>
  <Experience/>
  <Contact/>
</>
