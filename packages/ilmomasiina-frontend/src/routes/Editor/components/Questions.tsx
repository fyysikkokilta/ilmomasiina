import React from 'react';

import { useField } from 'formik';
import reject from 'lodash/reject';
import {
  Button, Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { SortEnd } from 'react-sortable-hoc';

import { FieldRow } from '@tietokilta/ilmomasiina-components';
import { QuestionType } from '@tietokilta/ilmomasiina-models';
import { EditorQuestion } from '../../../modules/editor/types';
import Sortable from './Sortable';

const Questions = () => {
  const [{ value: questions }, , { setValue }] = useField<EditorQuestion[]>('questions');
  const { t } = useTranslation();

  const QUESTION_TYPES: { value: EditorQuestion['type'], label: string }[] = [
    { value: QuestionType.TEXT, label: t('editor.questions.type.text') },
    { value: QuestionType.TEXT_AREA, label: t('editor.questions.type.textArea') },
    { value: QuestionType.NUMBER, label: t('editor.questions.type.number') },
    { value: QuestionType.SELECT, label: t('editor.questions.type.select') },
    { value: QuestionType.CHECKBOX, label: t('editor.questions.type.checkbox') },
  ];

  function addQuestion() {
    setValue([
      ...questions,
      {
        key: `new-${Math.random()}`,
        required: false,
        public: false,
        question: '',
        type: QuestionType.TEXT,
        options: [''],
      },
    ]);
  }

  function updateOrder({ newIndex, oldIndex }: SortEnd) {
    const newQuestions = questions.slice();
    const [elementToMove] = newQuestions.splice(oldIndex, 1);
    newQuestions.splice(newIndex, 0, elementToMove);
    setValue(newQuestions);
  }

  const questionItems = questions.map((question) => {
    const thisQuestion = question.key;

    function updateField<F extends keyof EditorQuestion>(field: F, value: EditorQuestion[F]) {
      setValue(questions.map((item) => {
        if (item.key === thisQuestion) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      }));
    }

    function removeQuestion() {
      setValue(reject(questions, { key: thisQuestion }));
    }

    function updateOption(optIndex: number, value: string) {
      setValue(questions.map((item) => {
        if (item.key === thisQuestion) {
          return {
            ...item,
            options: item.options?.map((prev, i) => (i === optIndex ? value : prev)) ?? null,
          };
        }
        return item;
      }));
    }

    function removeOption(optIndex: number) {
      setValue(questions.map((item) => {
        if (item.key === thisQuestion) {
          return {
            ...item,
            options: item.options?.filter((_prev, i) => i !== optIndex) ?? null,
          };
        }
        return item;
      }));
    }

    function addOption() {
      setValue(questions.map((item) => {
        if (item.key === thisQuestion) {
          return {
            ...item,
            options: [...item.options, ''],
          };
        }
        return item;
      }));
    }

    return (
      <Row key={question.key} className="question-body px-0">
        <Col xs="12" sm="9" xl="10">
          <FieldRow
            name={`question-${question.key}-question`}
            label={t('editor.questions.question') as string}
            required
          >
            <Form.Control
              type="text"
              required
              value={question.question}
              onChange={(e) => updateField('question', e.target.value)}
            />
          </FieldRow>
          <FieldRow
            name={`question-${question.key}-type`}
            label={t('editor.questions.type') as string}
            required
          >
            <Form.Control
              as="select"
              value={question.type}
              onChange={(e) => updateField('type', e.target.value as EditorQuestion['type'])}
              required
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type.label} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Control>
          </FieldRow>
          {(question.type === 'select' || question.type === 'checkbox') && (
            <>
              {question.options.map((option, optIndex) => (
                <FieldRow
                  name={`question-${question.key}-options-${optIndex}`}
                  label="Vastausvaihtoehto"
                  required
                  // eslint-disable-next-line react/no-array-index-key
                  key={optIndex}
                >
                  <InputGroup>
                    <Form.Control
                      type="text"
                      required
                      value={option}
                      onChange={(e) => updateOption(optIndex, e.target.value)}
                    />
                    <InputGroup.Append>
                      <Button
                        variant="outline-danger"
                        aria-label="Poista vastausvaihtoehto"
                        onClick={() => removeOption(optIndex)}
                      >
                        Poista
                      </Button>
                    </InputGroup.Append>
                  </InputGroup>
                </FieldRow>
              ))}
              <Row>
                <Col sm="3" />
                <Col sm="9">
                  <Button variant="secondary" type="button" onClick={addOption}>
                    Lisää vastausvaihtoehto
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Col>
        <Col xs="12" sm="3" xl="2" className="event-editor--question-buttons">
          <Form.Check
            id={`question-${question.key}-required`}
            label={t('editor.questions.mandatory')}
            checked={question.required}
            onChange={(e) => updateField('required', e.target.checked)}
            className="mb-3"
          />
          <Form.Check
            id={`question-${question.key}-public`}
            label={t('editor.questions.public')}
            checked={question.public}
            onChange={(e) => updateField('public', e.target.checked)}
            className="mb-3"
          />
          <Button variant="danger" type="button" onClick={removeQuestion}>
            {t('editor.questions.delete')}
          </Button>
        </Col>
      </Row>
    );
  });

  return (
    <>
      <Sortable
        collection="questions"
        items={questionItems}
        onSortEnd={updateOrder}
        useDragHandle
      />
      <div className="text-center mb-3">
        <Button type="button" variant="primary" onClick={addQuestion}>
          {t('editor.questions.add')}
        </Button>
      </div>
    </>
  );
};

export default Questions;
