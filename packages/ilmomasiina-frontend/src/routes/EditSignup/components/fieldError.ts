import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { SignupFieldError } from "@tietokilta/ilmomasiina-models";

const fieldErrors = new Map<unknown, SignupFieldError>(Object.values(SignupFieldError).map((code) => [code, code]));

/**
 * Localizes a SignupFieldError. Relies on the fact that server-sent errors on
 * EditSignup fields are always SignupFieldError enum values.
 */
export default function useFieldErrors() {
  const { t } = useTranslation();
  return useCallback(
    (error?: unknown): string[] | string | undefined => {
      if (!error) return undefined;
      const code = fieldErrors.get(error);
      return code ? t([`editSignup.fieldError.${code}`, "editSignup.fieldError"]) : t("editSignup.fieldError");
    },
    [t],
  );
}
