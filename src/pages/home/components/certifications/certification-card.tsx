import { Badge } from "@/components/ui/badge/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Calendar, ExternalLink } from "lucide-react";
import {useTranslation} from "react-i18next";

export type CertificationCardProps = {
  title: string;
  organization: string;
  date: string;
  skills?: string[];
  verificationUrl?: string;
}

export const CertificationCard = ({title, organization, date, skills = [], verificationUrl}: CertificationCardProps) => {
  const {t} = useTranslation();

  return <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600/70 transition-all hover:shadow-md hover:shadow-blue-300/20 dark:hover:shadow-blue-900/20">
    <CardHeader className="pb-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
        <div>
          <CardTitle className="text-xl text-gray-800 dark:text-white">{title}</CardTitle>
          <div className="text-blue-600 dark:text-blue-400 font-medium">{organization}</div>
        </div>
        <div
          className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={14} className="text-blue-600 dark:text-blue-400"/>
          <span>{date}</span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-2">
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((skill, index) => <Badge key={index} variant="outline" className="bg-gray-100 dark:bg-gray-800/50 text-xs border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          {skill}
        </Badge>)}
      </div>
      {verificationUrl && <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(verificationUrl, '_blank')}>
              <ExternalLink size={14}/>
              <span>{t('common:verify')}</span>
          </Button>
      </div>}
    </CardContent>
  </Card>
};