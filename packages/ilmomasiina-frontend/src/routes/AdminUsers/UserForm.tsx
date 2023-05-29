import React from 'react';

import { Field, Formik, FormikHelpers } from 'formik';
import {
  Button, Form, Spinner,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { createUser, getUsers } from '../../modules/adminUsers/actions';
import { useTypedDispatch } from '../../store/reducers';

type FormData = {
  email: string;
};

const UserForm = () => {
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  const onSubmit = async (data: FormData, { setSubmitting, resetForm }: FormikHelpers<FormData>) => {
    // TODO: better error handling
    const success = await dispatch(createUser(data));
    if (success) {
      dispatch(getUsers());
      resetForm();
      toast.success(t('adminUsers.createUser.success'), { autoClose: 2000 });
    } else {
      toast.error(t('adminUsers.createUser.failed'), { autoClose: 2000 });
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
