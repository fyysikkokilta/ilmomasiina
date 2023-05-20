import React, { useEffect } from 'react';

import { Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';

import requireAuth from '../../containers/requireAuth';
import { getAdminEvents, resetState } from '../../modules/adminEvents/actions';
import appPaths from '../../paths';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';
import AdminEventListItem from './AdminEventListItem';

const AdminEventsList = () => {
  const dispatch = useTypedDispatch();
  const { events, eventsLoadError } = useTypedSelector((state) => state.adminEvents, shallowEqual);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getAdminEvents());
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  if (eventsLoadError) {
    return (
      <>
        <h1>{t('errors.title')}</h1>
        <p>{t('events.loadFailed')}</p>
      </>
    );
  }

  if (!events) {
    return (
      <>
        <h1>{t('panel.title')}</h1>
        <Spinner animation="border" />
      </>
    );
  }

  return (
    <>
      <nav className="ilmo--title-nav">
        <h1>{t('panel.title')}</h1>
        <Button as={Link} variant="secondary" to={appPaths.adminUsersList}>
          {t('panel.users')}
        </Button>
        <Button as={Link} variant="secondary" to={appPaths.adminAuditLog}>
          {t('panel.activityLog')}
        </Button>
        <Button as={Link} variant="primary" to={appPaths.adminEditEvent('new')}>
          {t('panel.newEvent')}
        </Button>
      </nav>
      <table className="table">
        <thead>
          <tr>
            <th>{t('panel.name')}</th>
            <th>{t('panel.date')}</th>
            <th>{t('panel.status')}</th>
            <th>{t('panel.signups')}</th>
            <th>{t('panel.actions')}</th>
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
