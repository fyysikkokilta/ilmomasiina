import React, { useEffect } from 'react';

import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';

import { errorDesc, errorTitle } from '@tietokilta/ilmomasiina-components/dist/utils/errorMessage';
import requireAuth from '../../containers/requireAuth';
import { getUsers, resetState } from '../../modules/adminUsers/actions';
import appPaths from '../../paths';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';
import AdminUserListItem from './AdminUserListItem';
import ChangePasswordForm from './ChangePasswordForm';
import UserForm from './UserForm';

const AdminUsersList = () => {
  const dispatch = useTypedDispatch();
  const { users, loadError } = useTypedSelector((state) => state.adminUsers, shallowEqual);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getUsers());
    return () => {
      resetState();
    };
  }, [dispatch]);

  if (loadError) {
    return (
      <>
        <h1>{errorTitle(t, loadError, 'adminUsers.loadError')}</h1>
        <p>{errorDesc(t, loadError, 'adminUsers.loadError')}</p>
      </>
    );
  }

  let content = <Spinner animation="border" />;

  if (users) {
    content = (
      <>
        <table className="table">
          <thead>
            <tr>
              <th>{t('adminUsers.column.email')}</th>
              <th>{t('adminUsers.column.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <AdminUserListItem
                key={user.id}
                user={user}
              />
            ))}
          </tbody>
        </table>

        <h1>{t('adminUsers.createUser')}</h1>
        <UserForm />
        <h1>{t('adminUsers.changePassword')}</h1>
        <ChangePasswordForm />
      </>
    );
  }

  return (
    <>
      <Link to={appPaths.adminEventsList}>
        &#8592;
        {' '}
        {t('adminUsers.returnToEvents')}
      </Link>
      <h1>{t('adminUsers.title')}</h1>
      {content}
    </>
  );
};

export default requireAuth(AdminUsersList);
