import React from 'react';

import { Field, Formik, FormikHelpers } from 'formik';
import {
  Button, Form, Spinner,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { ApiError } from '@tietokilta/ilmomasiina-components';
import { errorDesc } from '@tietokilta/ilmomasiina-components/dist/utils/errorMessage';
import { createUser, getUsers } from '../../modules/adminUsers/actions';
import { useTypedDispatch } from '../../store/reducers';

type FormData = {
  email: string;
};

const UserForm = () => {
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  const onSubmit = async (data: FormData, { setSubmitting, resetForm }: FormikHelpers<FormData>) => {
    try {
      await dispatch(createUser(data));
      dispatch(getUsers());
      resetForm();
      toast.success(t('adminUsers.createUser.success', { email: data.email }), { autoClose: 2000 });
    } catch (err) {
      toast.error(
        errorDesc(t, err as ApiError, 'adminUsers.createUser.errors', { email: data.email }),
        { autoClose: 5000 },
      );
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, handleSubmit }) => (
        <Form
          className="ilmo--form"
          onSubmit={handleSubmit}
        >
          <Field
            as={Form.Control}
            name="email"
            id="email"
            type="email"
            placeholder={t('adminUsers.createUser.email')}
            aria-label={t('adminUsers.createUser.email')}
          />
          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? <Spinner animation="border" /> : t('adminUsers.createUser.submit')}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;
