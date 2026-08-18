import {useTranslation} from "react-i18next";
import {LANGUAGES, useA11y} from "@/lib/a11y";

/**
 * The header's one-tap language switch. It goes through the accessibility preferences rather than
 * straight to i18next, so the choice is persisted and the page's `lang` attribute follows it —
 * the same path the panel and the command palette take.
 */
export const useLanguageToggle = () => {
  const {i18n} = useTranslation();
  const {preferences, setPreference, announce} = useA11y();

  const toggleLanguage = () => {
    const next = preferences.language === "es" ? "en" : "es";
    setPreference("language", next);
    announce(i18n.t("a11y:settings.language.label") + ": " + i18n.t(`a11y:settings.language.options.${next}`));
  };

  return {language: preferences.language, languages: LANGUAGES, toggleLanguage};
};
