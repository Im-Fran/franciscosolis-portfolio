import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Calendar, Hotel, MapPin} from "lucide-react";
import {i18n} from "@/translations/translations.ts";
import { Key } from "react";

const Experience = () => <section className={"flex flex-col items-start justify-center gap-4 w-full"}>
  <div className={"flex flex-col items-start justify-center"}>
    <h2 className={"text-2xl font-semibold"}>{i18n.translate('experience.title')}</h2>
    <h4 className={"text-md text-neutral-500 dark:text-neutral-400"}>{i18n.translate('experience.description')}</h4>
  </div>


  <div className={"space-y-6"}>
    {i18n.translations[i18n.locale].experience.values.map((job: Job, index: Key | null | undefined) => (
      <Card key={index}>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription className={"flex items-center justify-start gap-2.5"}>
            <span className={"flex items-center justify-start gap-0.5"}>
              <Hotel className={"text-indigo-600"} size={16}/>
              {job.company}
            </span>

            <span className={"flex items-center justify-start gap-0.5"}>
              <Calendar className={"text-indigo-600"} size={16}/>
              {job.period}
            </span>

            <span className={"flex items-center justify-start gap-0.5"}>
              <MapPin className={"text-indigo-600"} size={16}/>
              {job.location}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{job.description}</p>
        </CardContent>
      </Card>
    ))}
  </div>
</section>;

interface Job {
  title: string | null | undefined;
  company: string | null | undefined;
  period: string | null | undefined;
  location: string | null | undefined;
  description: string | null | undefined;
}

export default Experience;