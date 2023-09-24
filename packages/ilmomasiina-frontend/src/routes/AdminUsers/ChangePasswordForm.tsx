import React from 'react';

import { Field, Formik, FormikHelpers } from 'formik';
import {
  Alert, Button, Form, Spinner,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiError } from '@tietokilta/ilmomasiina-components';
import { ErrorCode } from '@tietokilta/ilmomasiina-models';
import i18n from '../../i18n';
import { changePassword } from '../../modules/adminUsers/actions';
import { useTypedDispatch } from '../../store/reducers';

type FormData = {
  oldPassword: string;
  newPassword: string;
  newPasswordVerify: string;
};

const MIN_PASSWORD_LENGTH = 10;

function validate(values: FormData) {
  const errors: Partial<FormData> = {};
  if (!values.oldPassword) {
    errors.oldPassword = i18n.t('adminUsers.changePassword.errors.required');
  }
  if (!values.newPassword) {
    errors.newPassword = i18n.t('adminUsers.changePassword.errors.required');
  } else if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = i18n.t('adminUsers.changePassword.errors.minLength', { number: MIN_PASSWORD_LENGTH });
  }
  if (!values.newPasswordVerify) {
    errors.newPasswordVerify = i18n.t('adminUsers.changePassword.errors.required');
  } else if (values.newPassword && values.newPassword !== values.newPasswordVerify) {
    errors.newPasswordVerify = i18n.t('adminUsers.changePassword.errors.verifyMatch');
  }
  return errors;
}

const ChangePasswordForm = () => {
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  const onSubmit = async (data: FormData, { setSubmitting, resetForm }: FormikHelpers<FormData>) => {
    try {
      await dispatch(changePassword(data));
      resetForm();
      toast.success(t('adminUsers.changePassword.success'), { autoClose: 5000 });
    } catch (err) {
      if (err instanceof ApiError && err.code === ErrorCode.WRONG_OLD_PASSWORD) {
        toast.error(t('adminUsers.changePassword.wrongPassword'), { autoClose: 5000 });
      } else {
        toast.error(t('adminUsers.changePassword.failed'), { autoClose: 5000 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        oldPassword: '',
        newPassword: '',
        newPasswordVerify: '',
      }}
      onSubmit={onSubmit}
      validate={validate}
    >
      {({
        errors, touched, isSubmitting, handleSubmit,
      }) => (

        <Form
          className="ilmo--form"
          onSubmit={handleSubmit}
        >
          <Field
            as={Form.Control}
            name="oldPassword"
            id="oldPassword"
            type="password"
            placeholder={t('adminUsers.changePassword.oldPassword')}
            aria-label={t('adminUsers.changePassword.oldPassword')}
          />
          {errors.oldPassword && touched.oldPassword ? (
            <Alert variant="danger">{errors.oldPassword}</Alert>
          ) : null}
          <Field
            as={Form.Control}
            name="newPassword"
            id="newPassword"
            type="password"
            placeholder={t('adminUsers.changePassword.newPassword')}
            aria-label={t('adminUsers.changePassword.newPassword')}
          />
          {errors.newPassword && touched.newPassword ? (
            <Alert variant="danger">{errors.newPassword}</Alert>
          ) : null}
          <Field
            as={Form.Control}
            name="newPasswordVerify"
            id="newPasswordVerify"
            type="password"
            placeholder={t('adminUsers.changePassword.newPassword')}
            aria-label={t('adminUsers.changePassword.newPassword')}
          />
          {errors.newPasswordVerify && touched.newPasswordVerify ? (
            <Alert variant="danger">{errors.newPasswordVerify}</Alert>
          ) : null}
          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner animation="border" /> : t('adminUsers.changePassword.submit')}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePasswordForm;
