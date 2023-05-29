import React from 'react';

import { useTranslation } from 'react-i18next';

import { useEditSignupContext } from '../../../modules/editSignup';

const SignupStatus = () => {
  const { event, signup } = useEditSignupContext();
  const { status, position, quota } = signup!;
  const { openQuotaSize } = event!;
  const { t } = useTranslation();

  if (!status) return null;

  if (status === 'in-quota') {
    return (
      <p>
        {t(
          'editSignup.position.quota',
          { quota: quota.title, position: `${position}${quota.size ? ` / ${quota.size}` : ''}` },
        )}
      </p>
    );
  }

  if (status === 'in-open') {
    return (
      <p>
        {t('editSignup.position.openQuota', { position: `${position} / ${openQuotaSize}.` })}
      </p>
    );
  }

  return (
    <p>
      {t('editSignup.position.queue', { position })}
    </p>
  );
};

export default SignupStatus;
