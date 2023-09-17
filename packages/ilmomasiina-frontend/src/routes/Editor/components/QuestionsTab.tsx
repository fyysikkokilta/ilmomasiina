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
        label={t('editor.questions.nameQuestion')}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.questions.nameQuestion.check')}
        help={
          nameQuestion
            ? t('editor.questions.nameQuestion.infoOn')
            : t('editor.questions.nameQuestion.infoOff')
        }
      />
      <FieldRow
        name="emailQuestion"
        label={t('editor.questions.emailQuestion')}
        as={Form.Check}
        type="checkbox"
        checkAlign
        checkLabel={t('editor.questions.emailQuestion.check')}
        help={
          emailQuestion
            ? t('editor.questions.emailQuestion.infoOn')
            : t('editor.questions.emailQuestion.infoOff')
        }
      />
      <Questions />
    </div>
  );
};

export default QuestionsTab;
