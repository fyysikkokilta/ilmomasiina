import React from 'react';

import { FormApi } from 'final-form';
import {
  Button, Form as BsForm, FormControl, FormGroup, Spinner,
} from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
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

  const onSubmit = async (data: FormData, form: FormApi<FormData>) => {
    try {
      await dispatch(createUser(data));
      dispatch(getUsers());
      form.restart();
      toast.success(t('adminUsers.createUser.success', { email: data.email }), { autoClose: 2000 });
    } catch (err) {
      toast.error(
        errorDesc(t, err as ApiError, 'adminUsers.createUser.errors', { email: data.email }),
        { autoClose: 5000 },
      );
    }
  };

  return (
    <Form<FormData>
      initialValues={{
        email: '',
      }}
      onSubmit={onSubmit}
    >
      {({ submitting, handleSubmit }) => (
        <BsForm className="ilmo--form" onSubmit={handleSubmit}>
          <FormGroup>
            <Field name="email">
              {({ input }) => (
                <FormControl
                  {...input}
                  id="email"
                  type="email"
                  placeholder={t('adminUsers.createUser.email')}
                  aria-label={t('adminUsers.createUser.email')}
                />
              )}
            </Field>
          </FormGroup>
          <Button type="submit" variant="secondary" disabled={submitting}>
            {submitting ? <Spinner animation="border" /> : t('adminUsers.createUser.submit')}
          </Button>
        </BsForm>
      )}
    </Form>
  );
};

export default UserForm;
