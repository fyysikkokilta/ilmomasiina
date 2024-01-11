import React from 'react';

import { FORM_ERROR } from 'final-form';
import {
  Alert, Button, Form as BsForm, FormControl,
} from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useTranslation } from 'react-i18next';

import { errorDesc } from '@tietokilta/ilmomasiina-components/dist/utils/errorMessage';
import useEvent from '@tietokilta/ilmomasiina-components/dist/utils/useEvent';
import branding from '../../branding';
import FieldFormGroup from '../../components/FieldFormGroup';
import i18n from '../../i18n';
import { createInitialUser } from '../../modules/auth/actions';
import { useTypedDispatch } from '../../store/reducers';

import './InitialSetup.scss';

type FormData = {
  email: string;
  password: string;
  passwordVerify: string;
};

const initialValues: FormData = {
  email: '',
  password: '',
  passwordVerify: '',
};

const MIN_PASSWORD_LENGTH = 10;

function validate(values: FormData) {
  const errors: Partial<FormData> = {};
  if (!values.email) {
    errors.email = i18n.t('initialSetup.errors.required');
  }
  if (!values.password) {
    errors.password = i18n.t('initialSetup.errors.required');
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = i18n.t('initialSetup.errors.minLength', { number: MIN_PASSWORD_LENGTH });
  }
  if (!values.passwordVerify) {
    errors.passwordVerify = i18n.t('initialSetup.errors.required');
  } else if (values.password && values.password !== values.passwordVerify) {
    errors.passwordVerify = i18n.t('initialSetup.errors.verifyMatch');
  }
  return errors;
}

const InitialSetup = () => {
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  const onSubmit = useEvent(async (data: FormData) => {
    const { email, password } = data;
    try {
      await dispatch(createInitialUser(email, password));
      return undefined;
    } catch (err) {
      return { [FORM_ERROR]: err };
    }
  });

  return (
    <div className="setup-container">
      <h1>{t('initialSetup.title')}</h1>
      <p><strong>{t('initialSetup.welcome1')}</strong></p>
      <p>{t('initialSetup.welcome2')}</p>
      <Form<FormData> initialValues={initialValues} onSubmit={onSubmit} validate={validate}>
        {({ handleSubmit, submitting, submitError }) => (
          <BsForm onSubmit={handleSubmit} className="ilmo--form">
            {submitError && (
              <Alert variant="danger">{errorDesc(t, submitError, 'initialSetup.errors')}</Alert>
            )}
            <FieldFormGroup name="email" required label={t('initialSetup.email')}>
              {({ input, meta: { touched, error } }) => (
                <FormControl
                  {...input}
                  type="email"
                  required
                  placeholder={branding.loginPlaceholderEmail}
                  isInvalid={touched && error}
                />
              )}
            </FieldFormGroup>
            <FieldFormGroup name="password" required label={t('initialSetup.password')}>
              {({ input, meta: { touched, error } }) => (
                <FormControl
                  {...input}
                  type="password"
                  required
                  placeholder="••••••••"
                  isInvalid={touched && error}
                />
              )}
            </FieldFormGroup>
            <FieldFormGroup name="passwordVerify" required label={t('initialSetup.passwordVerify')}>
              {({ input, meta: { touched, error } }) => (
                <FormControl
                  {...input}
                  type="password"
                  required
                  placeholder="••••••••"
                  isInvalid={touched && error}
                />
              )}
            </FieldFormGroup>
            <Button type="submit" variant="secondary" disabled={submitting}>
              {t('initialSetup.submit')}
            </Button>
          </BsForm>
        )}
      </Form>
    </div>
  );
};

export default InitialSetup;
