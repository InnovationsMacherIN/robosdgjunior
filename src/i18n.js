// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './locales/translations';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: translations.de },
      en: { translation: translations.en },
      fi: { translation: translations.fi },
      ja: { translation: translations.ja }
    },
    lng: 'de', // oletuskieli saksa
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
