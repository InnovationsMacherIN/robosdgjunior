/**
 * @file i18n.js
 * @description This file contains the configuration for the i18next internationalization library.
 * @module i18n
 */
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
    lng: 'de',
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;