import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {useTranslation} from "react-i18next";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {useState} from "react";

export const Skills = () => {
  const {t} = useTranslation();
  const skills = t('skills:values', {returnObjects: true}) as Skill[];
  const [activeTab, setActiveTab] = useState(skills[0].id);

  return <section className="py-16">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2 text-center">{t('skills:title')}</h2>
      <p className="text-gray-400 text-center mb-8">{t('skills:description')}</p>

      <div className="w-full max-w-4xl mx-auto">
        <Tabs defaultValue={skills[0].id} className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <div className="relative mb-12">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-5 h-32 md:h-16 p-0 bg-gray-300/50 dark:bg-gray-900/50 rounded-lg md:rounded-full">
              {skills.map((skill: Skill) =>
                <TabsTrigger
                  key={`skill_selector_${skill.id}`}
                  value={skill.id}
                  className="rounded-full flex items-center justify-center text-center data-[state=active]:text-white data-[state=active]:shadow-none z-10 transition-all duration-300 font-medium"
                >
                  {skill.title}
                </TabsTrigger>
              )}

              {/* Sliding background */}
              <div className="absolute inset-0 p-1 pointer-events-none">
                <div className="md:hidden bg-gradient-to-r from-blue-600 to-indigo-800 h-1/2 w-1/3 rounded-lg transition-all duration-300 ease-in-out" style={{transform: `translate(${getSmallScreenXPosition(activeTab, skills)}%, ${getSmallScreenYPosition(activeTab, skills)}%)`}}/>

                {/* Fondo para pantallas medianas y grandes */}
                <div
                  className="hidden md:block bg-gradient-to-r from-blue-600 to-indigo-800 h-full rounded-full transition-transform duration-300 ease-in-out"
                  style={{
                    width: `${100 / skills.length}%`,
                    transform: `translateX(${skills.findIndex(s => s.id === activeTab) * 100}%)`
                  }}
                />
              </div>
            </TabsList>
          </div>

          {skills.map((skill: Skill) => (
            <TabsContent
              key={`${skill.id}_${skill.title}`}
              value={skill.id}
              className="mt-0 animate-in fade-in-50 duration-300"
            >
              <div className="flex flex-wrap gap-2">
                {skill.values.map((value, index) => (
                  <Badge
                    key={`${skill.id}_badge_${index}`}
                    variant="secondary"
                    size="lg"
                    className="bg-gray-300 dark:bg-blue-950/50 hover:bg-gray-500/50 dark:hover:bg-blue-900/50"
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  </section>
}

// Funciones auxiliares para el posicionamiento en pantallas pequeñas
function getSmallScreenXPosition(activeTab: string, skills: Skill[]): number {
  const index = skills.findIndex(s => s.id === activeTab);
  return (index % 3) * 100;
}

function getSmallScreenYPosition(activeTab: string, skills: Skill[]): number {
  const index = skills.findIndex(s => s.id === activeTab);
  return Math.floor(index / 3) * 100;
}

export type Skill = {
  id: string;
  title: string;
  values: string[]
}