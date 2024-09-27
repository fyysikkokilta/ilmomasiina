import { useCallback } from "react";

import { DefaultNamespace, ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";

import { SignupFieldError } from "@tietokilta/ilmomasiina-models";

/** Localizes a SignupFieldError. */
export default function useFieldErrors() {
  const { t } = useTranslation();
  return useCallback(
    (error?: SignupFieldError): string[] | string | undefined =>
      error ? t([`editSignup.fieldError.${error}` as ParseKeys<DefaultNamespace>, "editSignup.fieldError"]) : undefined,
    [t],
  );
}
