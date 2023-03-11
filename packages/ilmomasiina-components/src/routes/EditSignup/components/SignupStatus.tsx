import React from 'react';

import { useTranslation } from 'react-i18next';

import '../../../utils/i18n';

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
        {/* eslint-disable-next-line max-len */}
        {`${t('You are in quota x in position', { quota_title: quota.title })} ${position}${quota.size ? ` / ${quota.size}` : ''}.`}
      </p>
    );
  }

  if (status === 'in-open') {
    return (
      <p>
        {`${t('You are in open quota in position')} ${position} / ${openQuotaSize}.`}
      </p>
    );
  }

  return (
    <p>
      {`${t('You are in queue in position')} ${position}.`}
    </p>
  );
};

export default SignupStatus;
