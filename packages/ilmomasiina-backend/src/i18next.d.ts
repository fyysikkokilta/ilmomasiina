import { i18nResources } from "./i18n";

// Types for allowObjectInHTMLChildren, e.g. <strong>{{ name }}</strong> inside <Trans>.
import "react-i18next/augment-react";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof i18nResources)["fi"];
    allowObjectInHTMLChildren: true;
  }
}
