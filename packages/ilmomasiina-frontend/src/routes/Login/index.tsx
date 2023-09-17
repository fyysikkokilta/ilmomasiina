import React from 'react';

import { Field, Formik, FormikHelpers } from 'formik';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { login } from '../../modules/auth/actions';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';

import './Login.scss';

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const dispatch = useTypedDispatch();
  const { loginError } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();

  async function onSubmit(data: FormData, { setSubmitting }: FormikHelpers<FormData>) {
    const { email, password } = data;
    await dispatch(login(email, password));
    setSubmitting(false);
  }

  return (
    <div className="login-container">
      <h1>{t('login.title')}</h1>
      {loginError && (
        <p className="text-invalid">{t('login.loginFailed')}</p>
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
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
