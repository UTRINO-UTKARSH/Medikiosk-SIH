import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your JSON files (assuming they are in src/locales/)
import en from './locales/en.json';
import hi from './locales/hi.json';

i18n
  // 1. Tells i18n to detect the user's language (and save it to localStorage)
  .use(LanguageDetector)
  // 2. Passes the i18n instance to react-i18next
  .use(initReactI18next)
  // 3. Initialize the configuration
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi }
      // You can add 'mr' (Marathi) here later when you create the file!
    },
    fallbackLng: 'en', // If a translation is missing, it will default to English
    
    detection: {
      // Order matters: first check localStorage, then check the browser's default settings
      order: ['localStorage', 'navigator'],
      // The name of the key saved in the browser's memory
      caches: ['localStorage'] 
    },

    interpolation: {
      escapeValue: false // React already protects from XSS attacks, so we disable this
    }
  });

export default i18n;