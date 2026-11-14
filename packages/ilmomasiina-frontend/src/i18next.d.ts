import { defaultNS } from "./i18n";
import { i18nResources } from "./locales";

// Types for allowObjectInHTMLChildren, e.g. <strong>{{ name }}</strong> inside <Trans>.
import "react-i18next/augment-react";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof i18nResources)["fi"];
    defaultNS: (typeof defaultNS)[number];
    allowObjectInHTMLChildren: true;
  }
}
