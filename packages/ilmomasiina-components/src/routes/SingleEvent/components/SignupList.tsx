import React from 'react';

import filter from 'lodash/filter';
import { Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import '../../../utils/i18n';

import { useSingleEventContext } from '../../../modules/singleEvent';
import { OPENQUOTA, QuotaSignups, WAITLIST } from '../../../utils/signupUtils';
import SignupListRow from './SignupListRow';

type Props = {
  quota: QuotaSignups;
};

const SignupList = ({ quota }: Props) => {
  const { signups } = quota;
  const { questions, nameQuestion } = useSingleEventContext().event!;
  const showQuotas = quota.id === OPENQUOTA || quota.id === WAITLIST;
  const { t } = useTranslation();
  return (
    <div className="ilmo--quota-signups">
      <h3>{quota.title}</h3>
      {!signups?.length ? (
        <p>{t('singleEvent.signups.emptyQuota')}</p>
      ) : (
        <div className="table-responsive">
          <Table size="sm">
            <thead className="thead-light">
              <tr>
                <th key="position">{t('singleEvent.signups.position')}</th>
                {nameQuestion && (
                  <th key="attendee" style={{ minWidth: 90 }}>
                    {t('Name')}
                  </th>
                )}
                {filter(questions, 'public').map((question) => (
                  <th key={question.id}>
                    {question.question}
                  </th>
                ))}
                {showQuotas && (
                  <th key="quota">
                    {t('singleEvent.signups.quota')}
                  </th>
                )}
                <th key="datetime" style={{ minWidth: 130 }}>
                  {t('singleEvent.signups.signupTime')}
                </th>
              </tr>
            </thead>
            <tbody>
              {signups.map((signup, i) => (
                <SignupListRow
                  index={i + 1}
                  signup={signup}
                  showQuota={showQuotas}
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                />
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SignupList;
