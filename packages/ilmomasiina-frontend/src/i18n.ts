import i18n, { DefaultNamespace, ParseKeys } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { i18nResources as componentsRes } from "@tietokilta/ilmomasiina-client";
import en from "./locales/en.json";
import fi from "./locales/fi.json";

export const defaultNS = ["frontend", "public"] as const;
const fiCombined = { ...fi, ...componentsRes.fi } as const;
const enCombined = { ...en, ...componentsRes.en } as const;
export const resources = {
  // these generate typescript errors if not exact match
  fi: fiCombined satisfies typeof enCombined,
  en: enCombined satisfies typeof fiCombined,
} as const;

export type KnownLanguage = keyof typeof resources;
export const knownLanguages = Object.keys(resources) as KnownLanguage[];

export type TKey = ParseKeys<DefaultNamespace>;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS,
    supportedLngs: Object.keys(resources),
    interpolation: {
      // for React
      escapeValue: false,
    },
    debug: !PROD,
    react: {
      nsMode: "fallback",
    },
  });

export default i18n;
