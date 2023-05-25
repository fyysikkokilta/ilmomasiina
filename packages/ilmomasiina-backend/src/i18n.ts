import i18n from 'i18next';

import config from './config';
import * as en from './locales/en.json';
import * as fi from './locales/fi.json';

i18n.init({
  lng: config.mailDefaultLang,
  fallbackLng: config.mailDefaultLang,

  resources: {
    fi,
    en,
  },
});

export default i18n;
