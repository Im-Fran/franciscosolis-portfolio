import {useTranslation} from "react-i18next";
import {useEffect} from "react";
import {useTextSize} from "@/contexts/TextSizeContext.tsx";

const availableLangs = ['en', 'es']

const Footer = () => {
  const {t, i18n} = useTranslation();
  const {textSize, setTextSize} = useTextSize();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    localStorage.setItem('locale', newLang);
    await i18n.changeLanguage(newLang);
  }

  const changeTextSize = () => {
    const newSize = textSize === 'small' ? 'normal' : textSize === 'normal' ? 'large' : 'small';
    setTextSize(newSize);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');

    if (lang && availableLangs.includes(lang)) {
      i18n.changeLanguage(lang).then();
      localStorage.setItem('locale', lang);
    }

    const storedLang = localStorage.getItem('locale');
    if (storedLang && availableLangs.includes(storedLang)) {
      i18n.changeLanguage(storedLang).then();
    }
  }, [i18n]);

  return <footer role={"contentinfo"}>

    {/* Mobile Controls Group */}
    <div className="fixed right-0 bottom-0 -translate-y-1/2 z-50 flex flex-col gap-2">
      {/* Text Size Toggle */}
      <button
        onClick={changeTextSize}
        className="flex items-center justify-center py-3 px-2 bg-gray-200 dark:bg-gray-800 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded-l-lg border-r-0"
        aria-label={t('change_text_size')}
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {textSize === "small" ? "A" : textSize === "large" ? "A++" : "A+"}
          </span>
        </div>
      </button>

      {/* Lang Toggle */}
      <button
        onClick={toggleLanguage}
        className="flex items-center justify-center py-3 px-2 bg-gray-200 dark:bg-gray-800 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded-l-lg border-r-0"
        aria-label={t('change_language')}
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {i18n.language === "en" ? "🇺🇸" : "🇨🇱"}
          </span>
        </div>
      </button>
    </div>

    <div className={"w-full flex flex-col items-center justify-center text-center py-4 border-t gap-4"}>
      <div className={"flex items-center justify-center gap-2"}>
        {t('all_rights_reserved', {year: new Date().getFullYear()})}
      </div>
    </div>
  </footer>;
};

export default Footer;