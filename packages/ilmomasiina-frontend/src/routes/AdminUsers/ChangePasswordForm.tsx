import React from 'react';

import { FormApi } from 'final-form';
import {
  Button, Form as BsForm, FormControl, Spinner,
} from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiError } from '@tietokilta/ilmomasiina-components';
import { errorDesc } from '@tietokilta/ilmomasiina-components/dist/utils/errorMessage';
import useEvent from '@tietokilta/ilmomasiina-components/dist/utils/useEvent';
import FieldFormGroup from '../../components/FieldFormGroup';
import i18n from '../../i18n';
import { changePassword } from '../../modules/adminUsers/actions';
import { useTypedDispatch } from '../../store/reducers';

type FormData = {
  oldPassword: string;
  newPassword: string;
  newPasswordVerify: string;
};

const initialValues: FormData = {
  oldPassword: '',
  newPassword: '',
  newPasswordVerify: '',
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

  const onSubmit = useEvent(async (data: FormData, form: FormApi<FormData>) => {
    try {
      await dispatch(changePassword(data));
      form.restart();
      toast.success(t('adminUsers.changePassword.success'), { autoClose: 5000 });
    } catch (err) {
      toast.error(
        errorDesc(t, err as ApiError, 'adminUsers.changePassword.errors'),
        { autoClose: 5000 },
      );
    }
  });

  return (
    <Form<FormData>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
    >
      {({ submitting, handleSubmit }) => (
        <BsForm className="ilmo--form" onSubmit={handleSubmit}>
          <FieldFormGroup name="oldPassword" required label={t('adminUsers.changePassword.oldPassword')}>
            {({ input, meta: { touched, error } }) => (
              <FormControl
                {...input}
                type="password"
                required
                isInvalid={touched && error}
                placeholder="••••••••"
              />
            )}
          </FieldFormGroup>
          <FieldFormGroup name="newPassword" required label={t('adminUsers.changePassword.newPassword')}>
            {({ input, meta: { touched, error } }) => (
              <FormControl
                {...input}
                type="password"
                required
                isInvalid={touched && error}
                placeholder="••••••••"
              />
            )}
          </FieldFormGroup>
          <FieldFormGroup name="newPasswordVerify" required label={t('adminUsers.changePassword.newPasswordVerify')}>
            {({ input, meta: { touched, error } }) => (
              <FormControl
                {...input}
                type="password"
                required
                isInvalid={touched && error}
                placeholder="••••••••"
              />
            )}
          </FieldFormGroup>
          <Button type="submit" variant="secondary" disabled={submitting}>
            {submitting ? <Spinner animation="border" /> : t('adminUsers.changePassword.submit')}
          </Button>
        </BsForm>
      )}
    </Form>
  );
};

export default ChangePasswordForm;
