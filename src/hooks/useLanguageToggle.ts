import {useTranslation} from "react-i18next";

export const useLanguageToggle = () => {
  const {i18n} = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    localStorage.setItem("locale", newLang);
    await i18n.changeLanguage(newLang);
  };

  return {language: i18n.language, toggleLanguage};
};
