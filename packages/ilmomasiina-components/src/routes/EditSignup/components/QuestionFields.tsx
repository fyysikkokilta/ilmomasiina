import React, { ReactNode } from 'react';

import { useField } from 'formik';
import find from 'lodash-es/find';
import reject from 'lodash-es/reject';
import without from 'lodash-es/without';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import type { Question, SignupUpdateBody } from '@tietokilta/ilmomasiina-models';
import { QuestionType } from '@tietokilta/ilmomasiina-models';
import FieldRow from '../../../components/FieldRow';
import { stringifyAnswer } from '../../../utils/signupUtils';

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
        const answerValue = find(value, { questionId: question.id })?.answer || '';
        const currentAnswerString = stringifyAnswer(answerValue);
        const currentAnswerArray = Array.isArray(answerValue) ? answerValue : [];

        function updateAnswer(answer: string | string[]) {
          setValue(reject(value, { questionId: question.id }).concat({
            questionId: question.id,
            answer,
          }));
        }

        function toggleChecked(option: string, checked: boolean) {
          const newAnswers = checked ? [...currentAnswerArray, option] : without(currentAnswerArray, option);
          updateAnswer(newAnswers);
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
                value={currentAnswerString}
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
                value={currentAnswerString}
                onChange={(e) => updateAnswer(e.target.value)}
              />
            );
            break;
          case QuestionType.CHECKBOX: {
            input = question.options?.map((option, optIndex) => (
              <Form.Check
                // eslint-disable-next-line react/no-array-index-key
                key={optIndex}
                type="checkbox"
                id={`question-${question.id}-option-${optIndex}`}
                value={option}
                label={option}
                required={question.required && !currentAnswerArray.some((answer) => answer !== option)}
                disabled={disabled}
                checked={currentAnswerArray.includes(option)}
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
                value={currentAnswerString}
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
                  value={currentAnswerString}
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
                  checked={currentAnswerString === option}
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