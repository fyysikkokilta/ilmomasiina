import React, { useState } from 'react';

import { Formik, FormikHelpers } from 'formik';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import type { SignupUpdateBody } from '@tietokilta/ilmomasiina-models';
import FieldRow from '../../../components/FieldRow';
import { linkComponent, useNavigate } from '../../../config/router';
import { usePaths } from '../../../contexts/paths';
import { useEditSignupContext, useUpdateSignup } from '../../../modules/editSignup';
import DeleteSignup from './DeleteSignup';
import NarrowContainer from './NarrowContainer';
import QuestionFields from './QuestionFields';
import SignupStatus from './SignupStatus';

const EditForm = () => {
  const { event, signup, registrationClosed } = useEditSignupContext();
  const isNew = !signup!.confirmed;
  const updateSignup = useUpdateSignup();
  const Link = linkComponent();
  const navigate = useNavigate();
  const paths = usePaths();
  const { t, i18n: { language } } = useTranslation();

  // TODO: actually use errors from API
  const [submitError, setSubmitError] = useState(false);

  async function onSubmit(answers: SignupUpdateBody, { setSubmitting }: FormikHelpers<SignupUpdateBody>) {
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
      setSubmitError(false);
      setSubmitting(false);
      if (isNew) {
        navigate(paths.eventDetails(event!.slug));
      }
    } catch (error) {
      toast.update(progressToast, {
        render: isNew ? t('editSignup.status.signupFailed') : t('editSignup.status.editFailed'),
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      setSubmitError(true);
      setSubmitting(false);
    }
  }

  return (
    <Formik
      initialValues={signup! as SignupUpdateBody}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, isSubmitting }) => (
        <NarrowContainer>
          <h2>{isNew ? t('editSignup.title.signup') : t('editSignup.title.edit')}</h2>
          <SignupStatus />
          {submitError && (
            <p className="ilmo--form-error">{t('editSignup.errors.invalid')}</p>
          )}
          {registrationClosed && (
            <p className="ilmo--form-error">
              {t('editSignup.errors.closed')}
            </p>
          )}
          <Form onSubmit={handleSubmit} className="ilmo--form">
            {event!.nameQuestion && (
              <>
                <FieldRow
                  name="firstName"
                  label={t('editSignup.fields.firstName')}
                  placeholder={t('editSignup.fields.firstName.placeholder')}
                  required
                  readOnly={!isNew || registrationClosed}
                />
                <FieldRow
                  name="lastName"
                  label={t('editSignup.fields.lastName')}
                  placeholder={t('editSignup.fields.lastName.placeholder')}
                  required
                  readOnly={!isNew || registrationClosed}
                />
                <FieldRow
                  name="namePublic"
                  as={Form.Check}
                  type="checkbox"
                  disabled={registrationClosed}
                  checkAlign
                  checkLabel={(
                    <>
                      {t('editSignup.namePublic')}
                    </>
                  )}
                />
              </>
            )}
            {event!.emailQuestion && (
              <FieldRow
                name="email"
                label={t('editSignup.fields.email')}
                placeholder={t('editSignup.fields.email.placeholder')}
                required
                readOnly={!isNew || registrationClosed}
              />
            )}

            <QuestionFields name="answers" questions={event!.questions} disabled={registrationClosed} />

            {!registrationClosed && (
              <p>
                {t('editSignup.editInstructions')}
                {event!.emailQuestion && ` ${t('editSignup.editInstructions.email')}`}
              </p>
            )}

            {!registrationClosed && (
              <nav className="ilmo--submit-buttons">
                {!isNew && (
                  <Button as={Link} variant="link" to={paths.eventDetails(event!.slug)}>
                    {t('editSignup.action.cancel')}
                  </Button>
                )}
                <Button type="submit" variant="primary" formNoValidate disabled={isSubmitting}>
                  {isNew ? t('editSignup.action.save') : t('editSignup.action.edit')}
                </Button>
              </nav>
            )}
          </Form>
          {!registrationClosed && <DeleteSignup />}
        </NarrowContainer>
      )}
    </Formik>
  );
};

export default EditForm;
