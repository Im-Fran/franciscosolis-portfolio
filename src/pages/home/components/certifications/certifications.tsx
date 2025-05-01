import { useTranslation } from "react-i18next";
import { CertificationCard } from "./certification-card";

export type Certification = {
  title: string;
  organization: string;
  date: string;
  skills?: string[];
  verificationUrl?: string;
}

export const Certifications = () => {
  const { t } = useTranslation();

  return <section className="py-16 px-2.5">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2 text-center">{t('certifications:title')}</h2>
      <p className="text-gray-400 text-center mb-8">{t('certifications:description')}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        {(t('certifications:values', { returnObjects: true }) as Certification[]).map((cert, index) => <CertificationCard
            key={index}
            title={cert.title}
            organization={cert.organization}
            date={cert.date}
            skills={cert.skills}
            verificationUrl={cert.verificationUrl}
          />)}
      </div>
    </div>
  </section>;
};