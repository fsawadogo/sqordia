import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      fr: {
        translation: frTranslation
      }
    },
    fallbackLng: 'en',
    debug: import.meta.env.DEV, // Only enable debug in development

    interpolation: {
      escapeValue: false, // React handles escaping already
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    react: {
      useSuspense: false,
    }
  });

export default i18n;