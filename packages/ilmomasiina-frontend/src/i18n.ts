import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { i18n as componentsI18n, i18nResources as componentsRes } from '@tietokilta/ilmomasiina-components';
import * as en from './locales/en.json';
import * as fi from './locales/fi.json';

const resources = {
  fi: {
    ...componentsRes.fi,
    ...fi,
  },
  en: {
    ...componentsRes.en,
    ...en,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fi',
    defaultNS: ['frontend', 'components'],
    supportedLngs: Object.keys(resources),
    returnNull: false,
    interpolation: {
      // for React
      escapeValue: false,
    },
    debug: !PROD,
    react: {
      nsMode: 'fallback',
    },
  });

componentsI18n.init({ debug: !PROD });

i18n.on('languageChanged', (newLang) => {
  componentsI18n.changeLanguage(newLang);
});
componentsI18n.changeLanguage(i18n.language);

export default i18n;
