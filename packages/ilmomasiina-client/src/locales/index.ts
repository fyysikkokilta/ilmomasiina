import en from "./en.json";
import fi from "./fi.json";

// eslint-disable-next-line import/prefer-default-export
export const i18nResources = {
  // this way we generate typescript errors if not exact match
  fi: fi satisfies typeof en,
  en: en satisfies typeof fi,
} as const;
