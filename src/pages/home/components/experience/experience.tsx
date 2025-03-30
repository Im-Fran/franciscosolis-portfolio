import { Key } from "react";
import {useTranslation} from "react-i18next";
import {ExperienceCard} from "@/pages/home/components/experience/experience-card.tsx";

export const Experience = () => {
  const { t } = useTranslation()

  return <section className="py-16 px-2.5">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2 text-center">{t('experience:title')}</h2>
      <p className="text-gray-400 text-center mb-8">{t('experience:description')}</p>
    </div>


    <div className="space-y-6 max-w-4xl mx-auto">
      {(t('experience:values', { returnObjects: true }) as Job[]).map((job: Job, index: Key | null | undefined) => (
        <ExperienceCard key={index} title={job.title} company={job.company} period={job.period} location={job.location} description={job.description} />
      ))}
    </div>
  </section>
};

export type Job = {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
}