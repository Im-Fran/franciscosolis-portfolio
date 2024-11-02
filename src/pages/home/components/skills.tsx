import {useEffect, useState} from "react";
import {i18n} from "@/translations/translations.ts";

const Skills = () => {

  const [translations, setTranslations] = useState<Translations>(i18n.translations[i18n.locale].skills)

  useEffect(() => i18n.onChange(() => setTranslations(i18n.translations[i18n.locale].skills)),[])

  return <section className={"flex flex-col items-start justify-center gap-4 w-full"}>
    <div className={"flex flex-col items-start justify-center"}>
      <h2 className={"text-2xl font-semibold"}>{translations.title}</h2>
      <h4 className={"text-md text-neutral-500 dark:text-neutral-400"}>{translations.description}</h4>
    </div>

    <div className={"space-y-6 ml-2.5"}>
      {translations.values.map((skill: Skill) => (
        <div key={skill.title}>
          <h4 className={"text-lg font-semibold mb-3"}>{skill.title}</h4>
          <div className={"flex flex-wrap gap-2"}>
            {skill.values.map((skill, index) => <span key={index} className={"bg-indigo-500 text-indigo-100 rounded-full px-3 py-1 text-sm font-semibold"}>{skill}</span>)}
          </div>
        </div>
      ))}
    </div>
  </section>
}

interface Translations {
  title: string;
  description: string;

  values: [Skill]
}

interface Skill {
  title: string;
  values: [string]
}

export default Skills;