import React, { useEffect, useMemo, useState } from "react";

import { FORM_ERROR } from "final-form";
import { Button, Form as BsForm } from "react-bootstrap";
import { Form, FormRenderProps, useFormState } from "react-final-form";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import {
  ApiError,
  errorDesc,
  useDeleteSignup,
  useEditSignupContext,
  useUpdateSignup,
} from "@tietokilta/ilmomasiina-client";
import { ErrorCode, SignupValidationError } from "@tietokilta/ilmomasiina-models";
import type { TKey } from "../../../i18n";
import paths from "../../../paths";
import { useDurationFormatter } from "../../../utils/dateFormat";
import useEvent from "../../../utils/useEvent";
import CommonFields from "./CommonFields";
import DeleteSignup from "./DeleteSignup";
import { formDataToSignupUpdate, SignupFormData, signupToFormData } from "./formData";
import NarrowContainer from "./NarrowContainer";
import QuestionFields from "./QuestionFields";
import SignupStatus from "./SignupStatus";

const SubmitError = () => {
  const { isNew } = useEditSignupContext();
  const { submitError } = useFormState({ subscription: { submitError: true } });
  const { t } = useTranslation();

  return submitError ? (
    <p className="ilmo--form-error">
      {t(errorDesc<TKey>(submitError, isNew ? "editSignup.signupError" : "editSignup.editError"))}
    </p>
  ) : null;
};

/** The remaining unconfirmed edit time is highlighted when it goes below this value. */
const EXPIRY_WARNING_THRESHOLD = 5 * 60 * 1000;

const EditableUntil = () => {
  const {
    localizedEvent: event,
    signup,
    editingClosedOnLoad,
    editableUntil,
    confirmableUntil,
  } = useEditSignupContext();
  const { t } = useTranslation();
  const duration = useDurationFormatter();

  // Rerender every second
  const [, refresh] = useState({});
  useEffect(() => {
    if (editingClosedOnLoad) return undefined;
    const timer = window.setInterval(() => refresh({}), 1000);
    return () => window.clearInterval(timer);
  }, [editingClosedOnLoad]);

  if (editingClosedOnLoad) {
    return (
      <>
        <p>{t("editSignup.editable.closed")}</p>
        <p>
          <Link to={paths.eventDetails(event!.slug)}>{t("editSignup.backToEvent")}</Link>
        </p>
      </>
    );
  }

  const now = Date.now();
  if (signup!.confirmed) {
    return <p>{t("editSignup.editable.confirmed", { duration: duration(Math.max(editableUntil! - now)) })}</p>;
  }

  // Highlight when little time is left
  const timeLeft = Math.max(0, confirmableUntil! - now);
  const highlight = timeLeft < EXPIRY_WARNING_THRESHOLD;
  return (
    <p className={highlight ? "ilmo--form-error" : ""}>
      {t("editSignup.editable.unconfirmed", { duration: duration(timeLeft) })}
    </p>
  );
};

const EditFormSubmit = ({ disabled }: { disabled: boolean }) => {
  const { localizedEvent: event, editingClosedOnLoad, isNew, preview } = useEditSignupContext();
  const { t } = useTranslation();

  return editingClosedOnLoad ? null : (
    <>
      <p>
        {t("editSignup.editInstructions")}
        {event!.emailQuestion && ` ${t("editSignup.editInstructions.email")}`}
      </p>
      <nav className="ilmo--submit-buttons">
        {!preview && !isNew && (
          <Button as={Link} variant="link" to={paths.eventDetails(event!.slug)}>
            {t("editSignup.action.cancel")}
          </Button>
        )}
        {!preview && (
          <Button type="submit" variant="primary" formNoValidate disabled={disabled}>
            {isNew ? t("editSignup.action.save") : t("editSignup.action.edit")}
          </Button>
        )}
        {preview && (
          <Button variant="primary" onClick={() => preview.setPreviewingForm(false)}>
            {t("editSignup.action.back")}
          </Button>
        )}
      </nav>
    </>
  );
};

type BodyProps = FormRenderProps<SignupFormData> & {
  deleting: boolean;
  onDelete: () => void;
};

const EditFormBody = ({ handleSubmit, deleting, onDelete }: BodyProps) => {
  const { isNew, editingClosedOnLoad, preview } = useEditSignupContext();
  const { t } = useTranslation();
  const { submitting } = useFormState({ subscription: { submitting: true } });
  const onSubmit = useEvent(handleSubmit);

  return useMemo(
    () => (
      <NarrowContainer>
        <h2>
          {/* eslint-disable-next-line no-nested-ternary */}
          {preview ? t("editSignup.title.preview") : isNew ? t("editSignup.title.signup") : t("editSignup.title.edit")}
        </h2>
        <SignupStatus />
        <EditableUntil />
        <SubmitError />
        <BsForm onSubmit={onSubmit} className="ilmo--form">
          <CommonFields />
          <QuestionFields name="answers" />
          <EditFormSubmit disabled={submitting || deleting} />
        </BsForm>
        {!editingClosedOnLoad && !preview && <DeleteSignup deleting={deleting} onDelete={onDelete} />}
      </NarrowContainer>
    ),
    [onSubmit, onDelete, deleting, isNew, editingClosedOnLoad, submitting, preview, t],
  );
};

const EditForm = () => {
  const { localizedEvent: event, signup, isNew, preview } = useEditSignupContext();
  const updateSignup = useUpdateSignup();
  const deleteSignup = useDeleteSignup();
  const [deleting, setDeleting] = useState(false);
  const history = useHistory();
  const {
    t,
    i18n: { language },
  } = useTranslation();

  // Convert answers to object form for react-final-form.
  const initialValues = useMemo(() => signupToFormData(signup!), [signup]);

  const onSubmit = useEvent(async (formData: SignupFormData) => {
    if (preview) return undefined;
    const progressToast = toast.loading(isNew ? t("editSignup.status.signup") : t("editSignup.status.edit"));
    // Convert answers back from object to array.
    const update = formDataToSignupUpdate(formData);
    try {
      await updateSignup({ ...update, language });
      toast.update(progressToast, {
        render: isNew ? t("editSignup.status.signupSuccess") : t("editSignup.status.editSuccess"),
        type: toast.TYPE.SUCCESS,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      if (isNew) {
        history.push(paths.eventDetails(event!.slug));
      }
      return undefined;
    } catch (error) {
      toast.update(progressToast, {
        render: t(errorDesc<TKey>(error as ApiError, isNew ? "editSignup.signupError" : "editSignup.editError")),
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      // Augment the submit errors object if the error is a submit validation error.
      const errors =
        error instanceof ApiError && error.code === ErrorCode.SIGNUP_VALIDATION_ERROR
          ? (error.response! as SignupValidationError).errors
          : null;
      return { [FORM_ERROR]: error, ...errors };
    }
  });

  const onDelete = useEvent(async () => {
    const progressToast = toast.loading(t("editSignup.status.delete"));
    try {
      setDeleting(true);
      await deleteSignup();
      toast.update(progressToast, {
        render: t("editSignup.status.deleteSuccess"),
        type: toast.TYPE.SUCCESS,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      history.push(paths.eventDetails(event!.slug));
    } catch (error) {
      toast.update(progressToast, {
        render: t(errorDesc<TKey>(error as ApiError, "editSignup.deleteError")),
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
    } finally {
      setDeleting(false);
    }
  });

  return (
    <Form<SignupFormData> onSubmit={onSubmit} initialValues={initialValues}>
      {(props) => <EditFormBody {...props} deleting={deleting} onDelete={onDelete} />}
    </Form>
  );
};

export default EditForm;
