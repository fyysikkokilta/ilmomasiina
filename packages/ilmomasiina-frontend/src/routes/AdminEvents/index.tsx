import React, { useEffect } from 'react';

import { Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';

import { errorDesc, errorTitle } from '@tietokilta/ilmomasiina-components/dist/utils/errorMessage';
import requireAuth from '../../containers/requireAuth';
import { getAdminEvents, resetState } from '../../modules/adminEvents/actions';
import appPaths from '../../paths';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';
import AdminEventListItem from './AdminEventListItem';

const AdminEventsList = () => {
  const dispatch = useTypedDispatch();
  const { events, loadError } = useTypedSelector((state) => state.adminEvents, shallowEqual);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getAdminEvents());
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  if (loadError) {
    return (
      <>
        <h1>{errorTitle(t, loadError, 'adminEvents.loadError')}</h1>
        <p>{errorDesc(t, loadError, 'adminEvents.loadError')}</p>
      </>
    );
  }

  if (!events) {
    return (
      <>
        <h1>{t('adminEvents.title')}</h1>
        <Spinner animation="border" />
      </>
    );
  }

  return (
    <>
      <nav className="ilmo--title-nav">
        <h1>{t('adminEvents.title')}</h1>
        <Button as={Link} variant="secondary" to={appPaths.adminUsersList}>
          {t('adminEvents.nav.users')}
        </Button>
        <Button as={Link} variant="secondary" to={appPaths.adminAuditLog}>
          {t('adminEvents.nav.auditLog')}
        </Button>
        <Button as={Link} variant="primary" to={appPaths.adminEditEvent('new')}>
          {t('adminEvents.nav.newEvent')}
        </Button>
      </nav>
      <table className="table">
        <thead>
          <tr>
            <th>{t('adminEvents.column.name')}</th>
            <th>{t('adminEvents.column.date')}</th>
            <th>{t('adminEvents.column.status')}</th>
            <th>{t('adminEvents.column.signups')}</th>
            <th>{t('adminEvents.column.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <AdminEventListItem
              key={event.id}
              event={event}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default requireAuth(AdminEventsList);
