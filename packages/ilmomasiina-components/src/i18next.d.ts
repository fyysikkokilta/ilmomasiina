import { defaultNS, i18nResources } from "./i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof i18nResources)["fi"];
    defaultNS: typeof defaultNS;
  }
}
