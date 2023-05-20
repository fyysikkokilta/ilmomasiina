import React from 'react';

import { useFormikContext } from 'formik';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import { EditorEvent } from '../../../modules/editor/types';
import Questions from './Questions';

const QuestionsTab = () => {
  const { values: { nameQuestion, emailQuestion } } = useFormikContext<EditorEvent>();
  const { t } = useTranslation();
  return (
    <div>
      <FieldRow
        name="nameQuestion"
        label={t('editor.questions.name') as string}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.questions.collectNames') as string}
        help={
          nameQuestion
            ? t('editor.questions.nameMandatory')
            : t('editor.questions.nameNotMandatory')
        }
      />
      <FieldRow
        name="emailQuestion"
        label={t('editor.questions.email') as string}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.questions.collectEmail') as string}
        help={
          emailQuestion
            ? t('editor.questions.emailMandatory')
            : t('editor.questions.emailNotMandatory')
        }
      />
      <Questions />
    </div>
  );
};

export default QuestionsTab;
