import React, { ReactNode } from 'react';

import { useField } from 'formik';
import filter from 'lodash/filter';
import find from 'lodash/find';
import reject from 'lodash/reject';
import without from 'lodash/without';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import '../../../utils/i18n';

import type { Question, SignupUpdateBody } from '@tietokilta/ilmomasiina-models';
import { QuestionType } from '@tietokilta/ilmomasiina-models';
import FieldRow from '../../../components/FieldRow';

type Props = {
  name: string;
  questions: Question[];
  disabled?: boolean;
};

const QuestionFields = ({ name, questions, disabled }: Props) => {
  // TODO: add formik-based validation
  const [{ value }, , { setValue }] = useField<SignupUpdateBody['answers']>(name);
  const { t } = useTranslation();
  return (
    <>
      {questions.map((question) => {
        const currentAnswer = find(value, { questionId: question.id })?.answer || '';

        function updateAnswer(answer: string) {
          setValue(reject(value, { questionId: question.id }).concat({
            questionId: question.id,
            answer,
          }));
        }

        function toggleChecked(option: string, checked: boolean) {
          const currentAnswers = filter(currentAnswer.split(';'));
          const newAnswers = checked ? [...currentAnswers, option] : without(currentAnswers, option);
          updateAnswer(newAnswers.join(';'));
        }

        const help = question.public ? t('editSignup.publicQuestion') : null;

        let input: ReactNode;
        let isCheckboxes = false;
        switch (question.type) {
          case QuestionType.TEXT:
            input = (
              <Form.Control
                type="text"
                required={question.required}
                readOnly={disabled}
                value={currentAnswer}
                onChange={(e) => updateAnswer(e.target.value)}
              />
            );
            break;
          case QuestionType.NUMBER:
            input = (
              <Form.Control
                type="number"
                required={question.required}
                readOnly={disabled}
                value={currentAnswer}
                onChange={(e) => updateAnswer(e.target.value)}
              />
            );
            break;
          case QuestionType.CHECKBOX: {
            const currentAnswers = currentAnswer.split(';');
            input = question.options?.map((option, optIndex) => (
              <Form.Check
                // eslint-disable-next-line react/no-array-index-key
                key={optIndex}
                type="checkbox"
                id={`question-${question.id}-option-${optIndex}`}
                value={option}
                label={option}
                required={question.required && !currentAnswers.some((answer) => answer !== option)}
                disabled={disabled}
                checked={currentAnswers.includes(option)}
                onChange={(e) => toggleChecked(option, e.target.checked)}
              />
            ));
            isCheckboxes = true;
            break;
          }
          case QuestionType.TEXT_AREA:
            input = (
              <Form.Control
                as="textarea"
                rows={3}
                cols={40}
                required={question.required}
                readOnly={disabled}
                value={currentAnswer}
                onChange={(e) => updateAnswer(e.target.value)}
              />
            );
            break;
          case QuestionType.SELECT:
            if (question.options && question.options.length > 3) {
              input = (
                <Form.Control
                  as="select"
                  required={question.required}
                  disabled={disabled}
                  value={currentAnswer}
                  onChange={(e) => updateAnswer(e.target.value)}
                >
                  <option value="" disabled={question.required}>
                    Valitse&hellip;
                  </option>
                  {question.options?.map((option, optIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <option key={optIndex} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Control>
              );
            } else {
              input = question.options?.map((option, optIndex) => (
                <Form.Check
                  // eslint-disable-next-line react/no-array-index-key
                  key={optIndex}
                  type="radio"
                  id={`question-${question.id}-option-${optIndex}`}
                  inline
                  value={option}
                  label={option}
                  required={question.required}
                  disabled={disabled}
                  checked={currentAnswer === option}
                  onChange={(e) => updateAnswer(e.target.value)}
                />
              ));
              isCheckboxes = true;
            }
            break;
          default:
            return null;
        }

        return (
          <FieldRow
            key={question.id}
            name={`question-${question.id}`}
            label={question.question}
            required={question.required}
            help={help}
            checkAlign={isCheckboxes}
          >
            {input}
          </FieldRow>
        );
      })}
    </>
  );
};

export default QuestionFields;
