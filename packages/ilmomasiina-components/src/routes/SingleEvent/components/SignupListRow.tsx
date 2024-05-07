import React from 'react';

import filter from 'lodash/filter';
import find from 'lodash/find';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';

import '../../../utils/i18n';

import { timezone } from '../../../config';
import { useSingleEventContext } from '../../../modules/singleEvent';
import { SignupWithQuota } from '../../../utils/signupUtils';

type Props = {
  index: number;
  showQuota: boolean;
  signup: Omit<SignupWithQuota, 'id'>;
};

const SignupListRow = ({ showQuota, signup, index }: Props) => {
  const {
    firstName,
    lastName,
    namePublic,
    answers,
    quotaName,
    createdAt,
    confirmed,
  } = signup;

  const { questions, nameQuestion } = useSingleEventContext().event!;
  const { t } = useTranslation();

  let fullName;
  if (!confirmed) {
    fullName = t('singleEvent.signups.unconfirmed');
  } else if (!namePublic) {
    fullName = t('singleEvent.signups.nameHidden');
  } else {
    fullName = `${firstName || ''} ${lastName || ''}`;
  }

  return (
    <tr className={!confirmed ? 'ilmo--unconfirmed' : ''}>
      <td>
        {`${index}.`}
      </td>
      {nameQuestion && (
        <td className={!confirmed || !namePublic ? 'ilmo--hidden-name' : ''}>
          {fullName}
        </td>
      )}
      {filter(questions, 'public').map((question) => (
        <td key={question.id}>
          {find(answers, { questionId: question.id })?.answer || ''}
        </td>
      ))}
      {showQuota && (
        <td>
          {`${quotaName || ''}`}
        </td>
      )}
      <td>
        {moment(createdAt).tz(timezone()).format('DD.MM.YYYY HH:mm:ss')}
        <span className="ilmo--hover-only">
          {moment(createdAt).tz(timezone()).format('.SSS')}
        </span>
      </td>
    </tr>
  );
};

export default SignupListRow;
