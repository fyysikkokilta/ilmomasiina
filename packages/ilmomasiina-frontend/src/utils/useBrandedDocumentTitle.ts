import { useEffect } from "react";

import branding from "../branding";

export default function useBrandedDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} - ${branding.headerTitleShort}` : branding.headerTitleShort;
  }, [title]);
}
