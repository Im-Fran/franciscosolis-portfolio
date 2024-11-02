import {useEffect, useState} from "react";
import { i18n } from "@/translations/translations.ts";
import {ChevronDown} from "lucide-react";

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

  useEffect(() => {
    if (expanded) {
      setTimeout(() => window.scrollTo({
        top: document.body.scrollHeight + 500,
        behavior: "smooth"
      }), 50);
    }
  }, [expanded]);

  const openEmail = () => {
    const emailBase64 = "ZnNvbGlzbUBmcmFuY2lzY29zb2xpcy5jbA=="
    const email = atob(emailBase64)
    window.open(`mailto:${email}`)
  }

  return <div className={"w-full flex flex-col items-center justify-center text-center py-4 border-t gap-4"}>
    <div onClick={() => setExpanded(!expanded)} className={"flex items-center justify-center cursor-pointer gap-2"}>
      {translations.all_rights_reserved?.replace('{year}', `${new Date().getFullYear()}`)}
      <ChevronDown className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}/>
    </div>
    <div className={`overflow-hidden transition-max-height duration-300 ${expanded ? 'max-h-40' : 'max-h-0'}`}>
      <div className={"flex items-center justify-center gap-4"}>
        <div className={"flex justify-center items-center gap-2"}>
          <a href="https://github.com/Im-Fran" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/francisco-solis-maturana" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="#" onClick={openEmail}>Email</a>
        </div>
        <button onClick={toggleLanguage} className={"flex items-center justify-center px-1 py-0.5 border rounded"}>
          {locale === "en" ? "🇨🇱" : "🇺🇸"}
        </button>
      </div>
    </div>
  </div>;
};

export default Footer;