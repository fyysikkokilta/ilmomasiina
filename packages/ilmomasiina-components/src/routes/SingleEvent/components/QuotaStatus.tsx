import React from 'react';

import { useTranslation } from 'react-i18next';

import '../../../utils/i18n';

import { useSingleEventContext } from '../../../modules/singleEvent';
import { OPENQUOTA, WAITLIST } from '../../../utils/signupUtils';
import QuotaProgress from './QuotaProgress';

const QuotaStatus = () => {
  const { event, signupsByQuota } = useSingleEventContext();
  const { t } = useTranslation();
  return (
    <div className="ilmo--side-widget">
      <h3>{t('singleEvent.quotaCounts.title')}</h3>
      {signupsByQuota!.map((quota) => {
        if (quota.id === OPENQUOTA) {
          return (
            <QuotaProgress
              key={quota.id}
              title={t('singleEvent.quotaCounts.openQuota')}
              value={quota.signupCount}
              max={event!.openQuotaSize}
            />
          );
        }
        if (quota.id === WAITLIST) {
          if (quota.signupCount > 0) {
            return <p key={quota.id}>{t('singleEvent.quotaCounts.queue', { count: quota.signupCount })}</p>;
          }
          return null;
        }
        return (
          <QuotaProgress
            key={quota.id}
            title={quota.title!}
            value={quota.signupCount}
            max={quota.size || Infinity}
          />
        );
      })}
    </div>
  );
};

export default QuotaStatus;
