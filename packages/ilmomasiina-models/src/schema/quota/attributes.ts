import { Type } from "@sinclair/typebox";

import { Nullable } from "../utils";

export const quotaID = Type.String({
  title: "QuotaID",
  description: "Quota ID. Randomly generated alphanumeric string.",
  // TODO: Add validation? max-length?
});

/** Non-editable identity attributes of a quota. */
export const quotaIdentity = Type.Object({
  id: quotaID,
});

export const quotaTitle = Type.String({
  description: "Quota name.",
  minLength: 1,
  maxLength: 255,
});

/** Editable attributes of a quota language version. */
export const quotaPerLanguageAttributes = Type.Object({
  title: quotaTitle,
});

/** Schema for a quota language version. */
export const quotaLanguage = Type.Partial(quotaPerLanguageAttributes);

/** Editable attributes of a quota. */
export const quotaAttributes = Type.Composite([
  quotaPerLanguageAttributes,
  Type.Object({
    size: Nullable(Type.Integer({ minimum: 1 }), {
      description: "Maximum number of signups in the quota. If null, the size is unlimited.",
    }),
    languages: Type.Record(Type.String({ maxLength: 8 }), quotaLanguage),
  }),
]);
