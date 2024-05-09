import React, { useMemo, useState } from 'react';

import { FORM_ERROR } from 'final-form';
import { Button, Form as BsForm } from 'react-bootstrap';
import { Form, FormRenderProps, useFormState } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import type { SignupUpdateBody } from '@tietokilta/ilmomasiina-models';
import { ApiError } from '../../../api';
import { linkComponent, useNavigate } from '../../../config/router';
import { usePaths } from '../../../contexts/paths';
import { useDeleteSignup, useEditSignupContext, useUpdateSignup } from '../../../modules/editSignup';
import { errorDesc } from '../../../utils/errorMessage';
import useEvent from '../../../utils/useEvent';
import CommonFields from './CommonFields';
import DeleteSignup from './DeleteSignup';
import NarrowContainer from './NarrowContainer';
import QuestionFields from './QuestionFields';
import SignupStatus from './SignupStatus';

const SubmitError = () => {
  const { isNew } = useEditSignupContext();
  const { submitError } = useFormState({ subscription: { submitError: true } });
  const { t } = useTranslation();

  return submitError ? (
    <p className="ilmo--form-error">
      {errorDesc(t, submitError, isNew ? 'editSignup.signupError' : 'editSignup.editError')}
    </p>
  ) : null;
};

const RegistrationClosed = () => {
  const { event, registrationClosed } = useEditSignupContext();
  const paths = usePaths();
  const Link = linkComponent();
  const { t } = useTranslation();

  return registrationClosed ? (
    <>
      <p className="ilmo--form-error">
        {t('editSignup.errors.closed')}
      </p>
      <p>
        <Link to={paths.eventDetails(event!.slug)}>
          {t('editSignup.backToEvent')}
        </Link>
      </p>
    </>
  ) : null;
};

const EditFormSubmit = ({ disabled }: { disabled: boolean }) => {
  const { event, registrationClosed, isNew } = useEditSignupContext();
  const paths = usePaths();
  const Link = linkComponent();
  const { t } = useTranslation();

  return registrationClosed ? null : (
    <>
      <p>
        {t('editSignup.editInstructions')}
        {event!.emailQuestion && ` ${t('editSignup.editInstructions.email')}`}
      </p>
      <nav className="ilmo--submit-buttons">
        {!isNew && (
          <Button as={Link} variant="link" to={paths.eventDetails(event!.slug)}>
            {t('editSignup.action.cancel')}
          </Button>
        )}
        <Button type="submit" variant="primary" formNoValidate disabled={disabled}>
          {isNew ? t('editSignup.action.save') : t('editSignup.action.edit')}
        </Button>
      </nav>
    </>
  );
};

type BodyProps = FormRenderProps<SignupUpdateBody> & {
  deleting: boolean;
  onDelete: () => void;
};

const EditFormBody = ({ handleSubmit, deleting, onDelete }: BodyProps) => {
  const { isNew, registrationClosed } = useEditSignupContext();
  const { t } = useTranslation();
  const { submitting } = useFormState({ subscription: { submitting: true } });
  const onSubmit = useEvent(handleSubmit);

  return useMemo(() => (
    <NarrowContainer>
      <h2>{isNew ? t('editSignup.title.signup') : t('editSignup.title.edit')}</h2>
      <SignupStatus />
      <SubmitError />
      <RegistrationClosed />
      <BsForm onSubmit={onSubmit} className="ilmo--form">
        <CommonFields />
        <QuestionFields name="answers" />
        <EditFormSubmit disabled={submitting || deleting} />
      </BsForm>
      {!registrationClosed && <DeleteSignup deleting={deleting} onDelete={onDelete} />}
    </NarrowContainer>
  ), [onSubmit, onDelete, deleting, isNew, registrationClosed, submitting, t]);
};

const EditForm = () => {
  const { event, signup, isNew } = useEditSignupContext();
  const updateSignup = useUpdateSignup();
  const deleteSignup = useDeleteSignup();
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const paths = usePaths();
  const { t, i18n: { language } } = useTranslation();

  const onSubmit = useEvent(async (answers: SignupUpdateBody) => {
    const progressToast = toast.loading(isNew ? t('editSignup.status.signup') : t('editSignup.status.edit'));
    try {
      await updateSignup({
        ...answers,
        language,
      });
      toast.update(progressToast, {
        render: isNew ? t('editSignup.status.signupSuccess') : t('editSignup.status.editSuccess'),
        type: toast.TYPE.SUCCESS,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      if (isNew) {
        navigate(paths.eventDetails(event!.slug));
      }
      return undefined;
    } catch (error) {
      toast.update(progressToast, {
        render: errorDesc(t, error as ApiError, isNew ? 'editSignup.signupError' : 'editSignup.editError'),
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      return { [FORM_ERROR]: error };
    }
  });

  const onDelete = useEvent(async () => {
    const progressToast = toast.loading(t('editSignup.status.delete'));
    try {
      setDeleting(true);
      await deleteSignup();
      toast.update(progressToast, {
        render: t('editSignup.status.deleteSuccess'),
        type: toast.TYPE.SUCCESS,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      navigate(paths.eventDetails(event!.slug));
    } catch (error) {
      toast.update(progressToast, {
        render: errorDesc(t, error as ApiError, 'editSignup.deleteError'),
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
    <Form<SignupUpdateBody> onSubmit={onSubmit} initialValues={signup!}>
      {(props) => <EditFormBody {...props} deleting={deleting} onDelete={onDelete} />}
    </Form>
  );
};

export default EditForm;
