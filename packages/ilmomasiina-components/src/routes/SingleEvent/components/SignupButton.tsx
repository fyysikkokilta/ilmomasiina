import React, { useCallback, useState } from 'react';

import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import type { QuotaID } from '@tietokilta/ilmomasiina-models';
import { ApiError } from '../../../api';
import { useNavigate } from '../../../config/router';
import { usePaths } from '../../../contexts/paths';
import { beginSignup, useSingleEventContext } from '../../../modules/singleEvent';
import { errorDesc } from '../../../utils/errorMessage';
import { signupState, useSignupStateText } from '../../../utils/signupStateText';

// Show the countdown one minute before opening the signup.
const COUNTDOWN_DURATION = 60 * 1000;

type SignupButtonProps = {
  isOpen: boolean;
  isClosed: boolean;
  seconds: number;
  total: number;
};

const SignupButton = ({
  isOpen, isClosed, seconds, total,
}: SignupButtonProps) => {
  const navigate = useNavigate();
  const paths = usePaths();
  const { registrationStartDate, registrationEndDate, quotas } = useSingleEventContext().event!;
  const eventState = signupState(registrationStartDate, registrationEndDate);
  const [submitting, setSubmitting] = useState(false);
  const isOnly = quotas.length === 1;
  const { t } = useTranslation();

  const onClick = useCallback(async (quotaId: QuotaID) => {
    if (!isOpen) return;
    setSubmitting(true);
    const progressToast = toast.loading(t('singleEvent.signupInProgress'));
    try {
      const response = await beginSignup(quotaId);
      setSubmitting(false);
      navigate(paths.editSignup(response.id, response.editToken));
      toast.dismiss(progressToast);
    } catch (err) {
      setSubmitting(false);
      toast.update(progressToast, {
        render: errorDesc(t, err as ApiError, 'singleEvent.signupError'),
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        closeButton: true,
        closeOnClick: true,
        isLoading: false,
      });
    }
  }, [navigate, paths, isOpen, t]);

  const statusText = useSignupStateText(eventState);

  return (
    <div className="ilmo--side-widget">
      <h3>{t('singleEvent.signupButtons.title')}</h3>
      <p>
        {statusText.shortLabel}
        {total < COUNTDOWN_DURATION && !isOpen && !isClosed && (
          <span style={{ color: 'green' }}>
            {` (${seconds} s)`}
          </span>
        )}
      </p>
      {quotas.map((quota) => (
        <Button
          key={quota.id}
          type="button"
          variant="secondary"
          disabled={!isOpen || submitting}
          className="ilmo--signup-button"
          onClick={() => onClick(quota.id)}
        >
          {isOnly ? t('singleEvent.signupButton.singleQuota') : t('singleEvent.signupButton', { quota: quota.title })}
        </Button>
      ))}
    </div>
  );
};

export default SignupButton;
