import React from "react";

import { Form } from "react-bootstrap";
import { useFormState } from "react-final-form";
import { useTranslation } from "react-i18next";

import FieldRow from "../../../components/FieldRow";
import { useEditSignupContext } from "../../../modules/editSignup";
import fieldError from "./fieldError";

const CommonFields = () => {
  const { event, signup, registrationClosed } = useEditSignupContext();
  const { submitErrors } = useFormState({ subscription: { submitErrors: true } });
  const isNew = !signup!.confirmed;
  const { t } = useTranslation();
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
            readOnly={!isNew || registrationClosed}
            alternateError={fieldError(t, submitErrors?.firstName)}
          />
          <FieldRow
            name="lastName"
            maxLength={250}
            label={t("editSignup.fields.lastName")}
            placeholder={t("editSignup.fields.lastName.placeholder")}
            required
            readOnly={!isNew || registrationClosed}
            alternateError={fieldError(t, submitErrors?.lastName)}
          />
          <FieldRow
            name="namePublic"
            as={Form.Check}
            type="checkbox"
            disabled={registrationClosed}
            checkAlign
            checkLabel={<>{t("editSignup.namePublic")}</>}
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
          readOnly={!isNew || registrationClosed}
          alternateError={fieldError(t, submitErrors?.email)}
        />
      )}
    </>
  );
};

export default CommonFields;
