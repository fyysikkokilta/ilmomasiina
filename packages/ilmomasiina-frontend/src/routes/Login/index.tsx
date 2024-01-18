import React, { useState } from 'react';

import { Field, Formik, FormikHelpers } from 'formik';
import { Alert, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@tietokilta/ilmomasiina-components';
import { errorDesc } from '@tietokilta/ilmomasiina-components/dist/utils/errorMessage';
import { login } from '../../modules/auth/actions';
import { useTypedDispatch } from '../../store/reducers';

import './Login.scss';

type FormData = {
  email: string;
  password: string;
};

const initialValues: FormData = {
  email: '',
  password: '',
};

const Login = () => {
  const dispatch = useTypedDispatch();
  const [loginError, setLoginError] = useState<ApiError>();
  const { t } = useTranslation();

  const onSubmit = useEvent(async (data: FormData) => {
    const { email, password } = data;
    try {
      await dispatch(login(email, password));
      setLoginError(undefined);
    } catch (err) {
      setLoginError(err as ApiError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <h1>{t('login.title')}</h1>
      {loginError && (
        <Alert variant="danger">{errorDesc(t, loginError, 'login.errors')}</Alert>
      )}
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        onSubmit={onSubmit}
      >
        {({ handleSubmit, isSubmitting, errors }) => (
          <Form onSubmit={handleSubmit} className="ilmo--form">
            <Form.Group controlId="email">
              <Form.Label data-required>{t('login.email')}</Form.Label>
              <Field
                name="email"
                as={Form.Control}
                type="email"
                required
                placeholder="admin@athene.fi"
                isInvalid={errors.email}
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label data-required>{t('login.password')}</Form.Label>
              <Field
                name="password"
                as={Form.Control}
                type="password"
                required
                placeholder="••••••••"
                isInvalid={errors.password}
              />
            </Form.Group>
            <Button type="submit" variant="secondary" disabled={isSubmitting}>
              {t('login.submit')}
            </Button>
          </BsForm>
        )}
      </Form>
    </div>
  );
};

export default Login;
