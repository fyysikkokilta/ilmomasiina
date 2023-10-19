import React from 'react';

import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import DateTimePicker from './DateTimePicker';
import { useFieldValue } from './hooks';
import Quotas from './Quotas';

const QuotasTab = () => {
  const useOpenQuota = useFieldValue<boolean>('useOpenQuota');
  const { t } = useTranslation();
  return (
    <div>
      <FieldRow
        name="registrationStartDate"
        id="registrationStartDate"
        as={DateTimePicker}
        label={t('editor.quotas.registrationStartDate')}
        required
      />
      <FieldRow
        name="registrationEndDate"
        id="registrationEndDate"
        as={DateTimePicker}
        label={t('editor.quotas.registrationEndDate')}
        required
      />
      <FieldRow
        name="signupsPublic"
        label={t('editor.quotas.signupsPublic')}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.quotas.signupsPublic.check')}
      />
      <hr />
      <Quotas />
      <FieldRow
        name="useOpenQuota"
        label={t('editor.quotas.openQuota')}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.quotas.openQuota.check')}
        help={
          t('editor.quotas.openQuota.info')
        }
      />
      {useOpenQuota && (
        <FieldRow
          name="openQuotaSize"
          label={t('editor.quotas.openQuotaSize')}
          type="number"
          min="0"
          required
        />
      )}
    </div>
  );
};

export default QuotasTab;
