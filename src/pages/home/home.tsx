import GithubStats from "@/pages/home/components/github-stats.tsx";
import Projects from "@/pages/home/components/projects.tsx";
import Experience from "@/pages/home/components/experience.tsx";
import {useEffect, useState} from "react";
import {i18n} from "@/translations/translations.ts";
import Skills from "@/pages/home/components/skills.tsx";

const Home = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(i18n.translations[i18n.locale].personal_info)

  useEffect(() => i18n.onChange(() => setPersonalInfo(i18n.translations[i18n.locale].personal_info)), [])

  return <div className={"flex flex-col items-center justify-center h-full w-full py-20 gap-5"}>
    <div className={"flex items-center justify-center gap-2.5"}>
      <img src={"/profile-picture.webp"} alt={"Francisco Solís"} className={"rounded-full w-20 md:w-32"}/>

      <div className={"flex flex-col items-start justify-center md:gap-2.5"}>
        <h1 className={"text-2xl md:text-4xl font-bold"}>Francisco Solís Maturana</h1>
        <h4 className={"text-md md:text-xl text-neutral-500 dark:text-neutral-400"}>{personalInfo.title}</h4>
      </div>
    </div>

    <span
      className={"text-md text-neutral-500 dark:text-neutral-400 my-5 max-w-sm md:max-w-2xl text-center"}>{personalInfo.bio}</span>


    <div className={"flex flex-col items-center justify-center gap-10 max-w-sm md:max-w-3xl"}>
      <GithubStats/>
      <Projects/>
      <Skills/>
      <Experience/>
    </div>
  </div>
}

interface PersonalInfo {
  title: string | null | undefined;
  bio: string | null | undefined;
  github: string | null | undefined;
  linkedin: string | null | undefined;
  email: string | null | undefined;
}

export default Home;