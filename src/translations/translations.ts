import { I18n } from "i18n-js";
import translations from '@/translations/translations.json';
const i18n = new I18n(translations)
i18n.locale = localStorage.getItem('locale') || 'en'
export {i18n}