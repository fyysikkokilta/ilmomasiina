import React from 'react';

import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { useParams } from '../../config/router';
import { I18nProvider } from '../../i18n';
import { EditSignupProps, EditSignupProvider, useEditSignupContext } from '../../modules/editSignup';
import EditForm from './components/EditForm';
import NarrowContainer from './components/NarrowContainer';

const EditSignupView = () => {
  const { error, pending } = useEditSignupContext();
  const { t } = useTranslation();

  if (error) {
    return (
      <NarrowContainer className="ilmo--status-container">
        <h1>{t('errors.title')}</h1>
        <p>{t('editSignup.errors.loadFailed')}</p>
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

  // if (deleted) {
  //   return (
  //     <div className="ilmo--status-container">
  //       <h1>Ilmoittautumisesi poistettiin onnistuneesti / Registration deleted successfully</h1>
  //       <Button as={Link} to={paths().eventDetails(event!.slug)} variant="secondary">
  //         Takaisin / Back
  //       </Button>
  //     </div>
  //   );
  // }

  // if (event!.registrationEndDate === null || new Date(event!.registrationEndDate) < new Date()) {
  //   return (
  //     <NarrowContainer className="ilmo--status-container">
  //       <h1>Hups, jotain meni pieleen / Something went wrong</h1>
  //       <p>
  //         Ilmoittautumistasi ei voi enää muokata tai perua, koska tapahtuman
  //         ilmoittautuminen on sulkeutunut / Registration can't be edited or deleted
  //         as the signup is already closed.
  //       </p>
  //       <Button as={Link} to={paths().eventsList} variant="secondary">
  //         Takaisin etusivulle / Back to home page
  //       </Button>
  //     </NarrowContainer>
  //   );
  // }

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
