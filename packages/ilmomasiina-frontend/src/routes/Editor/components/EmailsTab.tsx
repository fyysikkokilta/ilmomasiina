import React from 'react';

import { useTranslation } from 'react-i18next';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import Textarea from './Textarea';

const EmailsTab = () => {
  const { t } = useTranslation();
  return (
    <FieldRow
      name="verificationEmail"
      as={Textarea}
      label={t('editor.emails.verificationEmail')}
      rows={10}
    />
  );
};

export default EmailsTab;
