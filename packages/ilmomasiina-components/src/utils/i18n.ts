import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as fi from '../locales/fi.json';
import * as en from '../locales/en.json';

const resources = {
  fi,
  en,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fi',
    fallbackLng: 'fi',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
