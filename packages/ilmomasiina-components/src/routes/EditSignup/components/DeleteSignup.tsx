import React, { useCallback } from 'react';

import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import '../../../utils/i18n';

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
    const progressToast = toast.loading(t('Deleting signup'));
    try {
      setSubmitting(true);
      await deleteSignup();
      toast.update(progressToast, {
        render: t('Your signup was deleted successfully'),
        type: toast.TYPE.SUCCESS,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
      navigate(paths.eventDetails(event!.slug));
    } catch (error) {
      setSubmitting(false);
      toast.update(progressToast, {
        render: t('Deletion failed'),
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
      <h2>{t('Delete signup')}</h2>
      <p>
        <Trans t={t}>
          {'Are you sure you want to delete your sign up to '}
          <strong>
            {{ event: event!.title }}
          </strong>
          ?
        </Trans>
      </p>
      <p>
        {/* eslint-disable-next-line max-len */}
        {t('If you delete your signup you will lose your spot in the queue. If you change your mind you can always sign up again to the event later, but you will be moved to the end of the queue.')}
        {' '}
        <strong>{t('This cannot be undone.')}</strong>
      </p>
      <ConfirmButton
        type="button"
        disabled={isSubmitting}
        onClick={doDelete}
        variant="danger"
        confirmDelay={DELETE_CONFIRM_MS}
        confirmLabel="Paina uudelleen varmistukseksi&hellip;"
      >
        {t('Delete signup')}
      </ConfirmButton>
    </div>
  );
};

export default DeleteSignup;
