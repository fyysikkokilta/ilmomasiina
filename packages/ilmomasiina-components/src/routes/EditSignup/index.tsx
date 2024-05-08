import React from 'react';

import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { useParams } from '../../config/router';
import { I18nProvider } from '../../i18n';
import { EditSignupProps, EditSignupProvider, useEditSignupContext } from '../../modules/editSignup';
import { errorDesc, errorTitle } from '../../utils/errorMessage';
import EditForm from './components/EditForm';
import NarrowContainer from './components/NarrowContainer';

const EditSignupView = () => {
  const { error, pending } = useEditSignupContext();
  const { t } = useTranslation();

  if (error) {
    return (
      <NarrowContainer className="ilmo--status-container">
        <h1>{errorTitle(t, error, 'editSignup.loadError')}</h1>
        <p>{errorDesc(t, error, 'editSignup.loadError')}</p>
      </NarrowContainer>
    );
  }

  if (pending) {
    return (
      <div className="ilmo--loading-container">
        <Spinner animation="border" />
      </div>
    );
  }

  return <EditForm />;
};

const EditSignup = () => {
  const { id, editToken } = useParams<EditSignupProps>();
  return (
    <EditSignupProvider id={id} editToken={editToken}>
      <I18nProvider>
        <EditSignupView />
      </I18nProvider>
    </EditSignupProvider>
  );
};

export default EditSignup;
