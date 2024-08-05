import { TFunction } from "i18next";

import { SignupFieldError } from "@tietokilta/ilmomasiina-models";

/** Localizes a SignupFieldError. */
export default function fieldError(t: TFunction, error?: SignupFieldError): string | undefined {
  return error
    ? // @ts-expect-error TS can't resolve the dynamic SignupFieldError to the key type here
      t([`editSignup.fieldError.${error}`, "editSignup.fieldError"])
    : undefined;
}
