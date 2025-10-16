import React from "react";

import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import { useEditSignupContext } from "@tietokilta/ilmomasiina-client";
import FieldRow from "../../../components/FieldRow";
import useFieldErrors from "./fieldError";

const CommonFields = () => {
  const { localizedEvent: event, signup, editingClosedOnLoad, admin } = useEditSignupContext();
  const isNew = !signup!.confirmed;
  const { t } = useTranslation();
  const formatError = useFieldErrors();

  const canEditNameAndEmail = isNew && !editingClosedOnLoad;

  return (
    <>
      {event!.nameQuestion && (
        <>
          <FieldRow
            name="firstName"
            maxLength={250}
            label={t("editSignup.fields.firstName")}
            placeholder={t("editSignup.fields.firstName.placeholder")}
            required
            readOnly={!canEditNameAndEmail && !admin}
            formatError={formatError}
          />
          <FieldRow
            name="lastName"
            maxLength={250}
            label={t("editSignup.fields.lastName")}
            placeholder={t("editSignup.fields.lastName.placeholder")}
            required
            readOnly={!canEditNameAndEmail && !admin}
            formatError={formatError}
          />
          <FieldRow
            name="namePublic"
            as={Form.Check}
            type="checkbox"
            disabled={editingClosedOnLoad && !admin}
            checkAlign
            checkLabel={t("editSignup.namePublic")}
          />
        </>
      )}
      {event!.emailQuestion && (
        <FieldRow
          name="email"
          maxLength={250}
          label={t("editSignup.fields.email")}
          placeholder={t("editSignup.fields.email.placeholder")}
          required
          readOnly={!canEditNameAndEmail && !admin}
          formatError={formatError}
        />
      )}
    </>
  );
};

export default CommonFields;
