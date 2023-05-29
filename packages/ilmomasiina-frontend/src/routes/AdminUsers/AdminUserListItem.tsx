import React from 'react';

import { Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import type { UserSchema } from '@tietokilta/ilmomasiina-models';
import { deleteUser, getUsers, resetUserPassword } from '../../modules/adminUsers/actions';
import { useTypedDispatch } from '../../store/reducers';

type Props = {
  user: UserSchema;
};

const AdminUserListItem = ({ user }: Props) => {
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  async function onDelete() {
    const confirmed = window.confirm(t('adminUsers.deleteUser.confirm', { user: user.email }));
    if (confirmed) {
      const success = await dispatch(deleteUser(user.id));
      if (!success) {
        toast.error(t('adminUsers.deleteUser.failed'), { autoClose: 5000 });
      } else {
        toast.success(t('adminUsers.deleteUser.success'), { autoClose: 5000 });
      }
      dispatch(getUsers());
    }
  }
  async function onResetPassword() {
    const confirmed = window.confirm(t('adminUsers.resetPassword.confirm', { user: user.email }));
    if (confirmed) {
      const success = await dispatch(resetUserPassword(user.id));
      if (!success) {
        toast.error(t('adminUsers.resetPassword.failed'), { autoClose: 5000 });
      } else {
        toast.success(t('adminUsers.resetPassword.success'), { autoClose: 5000 });
      }
    }
  }
  return (
    <tr>
      <td>{user.email}</td>
      <td>
        <ButtonGroup size="sm">
          <Button type="button" onClick={onResetPassword} size="sm" variant="secondary">
            {t('adminUsers.resetPassword')}
          </Button>
          <Button type="button" onClick={onDelete} size="sm" variant="danger">
            {t('adminUsers.deleteUser')}
          </Button>
        </ButtonGroup>
      </td>
    </tr>
  );
};

export default AdminUserListItem;
