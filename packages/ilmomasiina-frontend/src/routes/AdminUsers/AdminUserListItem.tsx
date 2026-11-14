import React from "react";

import { Button, ButtonGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { errorDesc } from "@tietokilta/ilmomasiina-client";
import type { UserSchema } from "@tietokilta/ilmomasiina-models";
import useConfirmDialog from "../../components/ConfirmDialog";
import type { TKey } from "../../i18n";
import useStore from "../../modules/store";

type Props = {
  user: UserSchema;
};

const AdminUserListItem = ({ user }: Props) => {
  const { deleteUser, getUsers, resetUserPassword } = useStore((state) => state.adminUsers);
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirmDialog();

  async function onDelete() {
    const confirmed = await confirm(t("adminUsers.deleteUser.confirm", { user: user.email }));
    if (confirmed) {
      try {
        await deleteUser(user.id);
        toast.success(t("adminUsers.deleteUser.success", { user: user.email }), {
          autoClose: 5000,
        });
      } catch (err) {
        toast.error(
          t(errorDesc<TKey>(err, "adminUsers.deleteUser.errors"), {
            user: user.email,
          }),
          { autoClose: 5000 },
        );
      }
      void getUsers();
    }
  }
  async function onResetPassword() {
    const confirmed = await confirm(t("adminUsers.resetPassword.confirm", { user: user.email }));
    if (confirmed) {
      try {
        await resetUserPassword(user.id);
        toast.success(t("adminUsers.resetPassword.success", { user: user.email }), {
          autoClose: 5000,
        });
      } catch (err) {
        toast.error(
          t(errorDesc<TKey>(err, "adminUsers.resetPassword.errors"), {
            user: user.email,
          }),
          { autoClose: 5000 },
        );
      }
    }
  }
  return (
    <>
      <tr>
        <td>{user.email}</td>
        <td>
          <ButtonGroup size="sm">
            <Button type="button" onClick={() => void onResetPassword()} size="sm" variant="secondary">
              {t("adminUsers.resetPassword")}
            </Button>
            <Button type="button" onClick={() => void onDelete()} size="sm" variant="danger">
              {t("adminUsers.deleteUser")}
            </Button>
          </ButtonGroup>
        </td>
      </tr>
      {dialog}
    </>
  );
};

export default AdminUserListItem;
