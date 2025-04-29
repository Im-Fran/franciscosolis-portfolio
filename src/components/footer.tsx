import {useTranslation} from "react-i18next";
  import {useEffect} from "react";

  const availableLangs = ['en', 'es']

  const Footer = () => {
    const {t, i18n} = useTranslation()

    const toggleLanguage = async () => {
      const newLang = i18n.language === 'es' ? 'en' : 'es';
      localStorage.setItem('locale', newLang);
      await i18n.changeLanguage(newLang);
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
      <button
        onClick={toggleLanguage}
        className="md:hidden fixed right-0 bottom-0 -translate-y-1/2 z-50 flex items-center justify-center py-3 px-2
                bg-gray-200 dark:bg-gray-800 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors
                rounded-l-lg border-r-0"
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

      <div className={"w-full flex flex-col items-center justify-center text-center py-4 border-t gap-4"}>
        <div className={"flex items-center justify-center gap-2"}>
          {t('all_rights_reserved', {year: new Date().getFullYear()})}
          <button onClick={toggleLanguage} className={"hidden md:flex items-center justify-center px-2 py-1"}>
            {i18n.language === "en" ? "🇺🇸" : "🇨🇱"}
          </button>
        </div>
      </div>
    </footer>;
  };

  export default Footer;