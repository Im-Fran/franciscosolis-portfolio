import {useEffect, useState} from "react";
import { i18n } from "@/translations/translations.ts";

const Footer = () => {
  const [translations, setTranslations] = useState<{
    all_rights_reserved: string | null | undefined;
    toggle_lang: string | null | undefined;
  }>(i18n.translations[i18n.locale].footer)
  const [expanded, setExpanded] = useState(false);
  const [locale, setLocale] = useState<string>(localStorage.getItem('locale') || 'en')

  const toggleLanguage = () => setLocale(locale === "en" ? "es" : "en");

  useEffect(() => {
    if(localStorage.getItem('locale') != locale) {
      localStorage.setItem('locale', locale)
      i18n.locale = locale
    }
  }, [locale])

  useEffect(() => i18n.onChange(() => setTranslations(i18n.translations[i18n.locale].footer)), []);

  return (
    <div className="w-full text-center py-4 border-t">
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
        {translations.all_rights_reserved?.replace('{year}', `${new Date().getFullYear()}`)}
      </div>
      {expanded && (
        <div className="mt-4">
          <div className="flex flex-col items-center gap-2">
            <a href="https://github.com/Im-Fran" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/francisco-solis-maturana" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:francisco@example.com">Email</a>
          </div>
          <button onClick={toggleLanguage} className="mt-4 px-4 py-2 border rounded">
            {translations.toggle_lang?.replace('{lang}', locale === "en" ? "es" : "en")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Footer;