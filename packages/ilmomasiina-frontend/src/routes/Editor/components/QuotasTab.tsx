import React from 'react';

import { useFormikContext } from 'formik';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import { EditorEvent } from '../../../modules/editor/types';
import DateTimePicker from './DateTimePicker';
import Quotas from './Quotas';

const QuotasTab = () => {
  const { values: { useOpenQuota } } = useFormikContext<EditorEvent>();
  const { t } = useTranslation();
  return (
    <div>
      <FieldRow
        name="registrationStartDate"
        as={DateTimePicker}
        label={t('editor.quotas.start') as string}
        required
      />
      <FieldRow
        name="registrationEndDate"
        as={DateTimePicker}
        label={t('editor.quotas.end') as string}
        required
      />
      <FieldRow
        name="signupsPublic"
        label={t('editor.quotas.publicity') as string}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.quotas.publicQuota')}
      />
      <hr />
      <Quotas />
      <FieldRow
        name="useOpenQuota"
        label={t('editor.quotas.openQuota') as string}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.quotas.jointQuota')}
        help={
          t('editor.quotas.help')
        }
      />
      {useOpenQuota && (
        <FieldRow
          name="openQuotaSize"
          label={t('editor.quotas.openQuotaSize') as string}
          type="number"
          min="0"
          required
        />
      )}
    </div>
  );
};

export default QuotasTab;
