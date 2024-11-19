import { I18n } from "i18n-js";
import translations from '@/translations/translations.json';
const i18n = new I18n(translations)
i18n.defaultLocale = 'es'
i18n.locale = localStorage.getItem('locale') || 'es'
i18n.enableFallback = true

// If there's a ?lang=xx in the URL, use that language
const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang');
if (lang && i18n.locales.get(lang)) {
  i18n.locale = lang;
  localStorage.setItem('locale', lang);
  urlParams.delete('lang');
  window.history.replaceState({}, '', `${window.location.pathname}${urlParams.toString()}`);
}

export {i18n}