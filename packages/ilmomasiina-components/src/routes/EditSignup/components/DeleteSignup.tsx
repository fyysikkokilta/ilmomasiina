import React, { useCallback } from 'react';

import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import ConfirmButton from '../../../components/ConfirmButton';
import { useNavigate } from '../../../config/router';
import { usePaths } from '../../../contexts';
import { useDeleteSignup, useEditSignupContext } from '../../../modules/editSignup';

const DELETE_CONFIRM_MS = 4000;

const DeleteSignup = () => {
  const { event } = useEditSignupContext();
  const deleteSignup = useDeleteSignup();
  const navigate = useNavigate();
  const paths = usePaths();
  const { t } = useTranslation();

  const { isSubmitting, setSubmitting } = useFormikContext();

  const doDelete = useCallback(async () => {
    const progressToast = toast.loading(t('editSignup.status.delete'));
    try {
      setSubmitting(true);
      await deleteSignup();
      toast.update(progressToast, {
        render: t('editSignup.status.deleteSuccess'),
        type: toast.TYPE.SUCCESS,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      navigate(paths.eventDetails(event!.slug));
    } catch (error) {
      setSubmitting(false);
      toast.update(progressToast, {
        render: t('editSignup.status.deleteFailed'),
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
    }
  }, [deleteSignup, event, navigate, paths, setSubmitting, t]);

  return (
    <div className="ilmo--delete-container">
      <h2>{t('editSignup.delete.action')}</h2>
      <p>
        <Trans t={t} i18nKey="editSignup.delete.info1">
          {'Are you sure you want to delete your sign up to '}
          <strong>
            {{ event: event!.title }}
          </strong>
          ?
        </Trans>
      </p>
      <p>
        {/* eslint-disable-next-line max-len */}
        {t('editSignup.delete.info2')}
        {' '}
        <strong>{t('editSignup.delete.info3')}</strong>
      </p>
      <ConfirmButton
        type="button"
        disabled={isSubmitting}
        onClick={doDelete}
        variant="danger"
        confirmDelay={DELETE_CONFIRM_MS}
        confirmLabel={t('editSignup.delete.action.confirm')}
      >
        {t('editSignup.delete.action')}
      </ConfirmButton>
    </div>
  );
};

export default DeleteSignup;
