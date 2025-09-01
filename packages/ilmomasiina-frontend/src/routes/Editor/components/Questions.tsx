import React, { useMemo } from "react";

import { mapValues } from "lodash-es";
import { Button, Col, Form, FormCheckProps, InputGroup, Row } from "react-bootstrap";
import { Field, FieldRenderProps, useForm } from "react-final-form";
import { FieldArray, FieldArrayRenderProps, useFieldArray } from "react-final-form-arrays";
import { useTranslation } from "react-i18next";
import { SortEnd } from "react-sortable-hoc";

import { FieldRow } from "@tietokilta/ilmomasiina-components";
import useEvent from "@tietokilta/ilmomasiina-components/dist/utils/useEvent";
import useShallowMemo from "@tietokilta/ilmomasiina-components/dist/utils/useShallowMemo";
import { QuestionType, questionUpdate } from "@tietokilta/ilmomasiina-models";
import { EditorEvent, EditorQuestion } from "../../../modules/editor/types";
import useEditorErrors from "./errors";
import { useFieldValue } from "./hooks";
import LocalizedFieldRow from "./LocalizedFieldRow";
import SelectBox from "./SelectBox";
import Sortable from "./Sortable";

export const maxOptionsPerQuestion = questionUpdate.properties.options.maxItems ?? Infinity;

type OptionProps = {
  name: string;
  index: number;
  remove: FieldArrayRenderProps<string, HTMLElement>["fields"]["remove"];
};

const renderInput = ({ input, meta, ...props }: FieldRenderProps<any>) => <Form.Control {...input} {...props} />;

type CheckboxRenderProps = { input: FormCheckProps };

const renderCheck = ({ input, meta, ...props }: FieldRenderProps<boolean> & CheckboxRenderProps) => (
  <Form.Check {...input} {...props} />
);

const OptionRow = ({ name, index, remove }: OptionProps) => {
  const { t } = useTranslation();
  const formatError = useEditorErrors();

  const removeThis = useEvent(() => remove(index));

  return (
    <FieldRow name={name} type="text" label={t("editor.questions.questionOptions")} required formatError={formatError}>
      <InputGroup>
        <Field name={name} required maxLength={255}>
          {renderInput}
        </Field>
        <InputGroup.Append>
          <Button variant="outline-danger" onClick={removeThis}>
            {t("editor.questions.questionOptions.delete")}
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </FieldRow>
  );
};

type QuestionProps = {
  name: string;
  index: number;
  remove: FieldArrayRenderProps<EditorQuestion, HTMLElement>["fields"]["remove"];
};

const QuestionRow = ({ name, index, remove }: QuestionProps) => {
  const { t } = useTranslation();
  const {
    mutators: { push },
  } = useForm();
  const formatError = useEditorErrors();

  const removeThis = useEvent(() => remove(index));

  const addOption = useEvent(() => push(`${name}.options`, ""));

  const type = useFieldValue(`${name}.type`);

  return (
    <Row className="question-body px-0">
      <Col xs="12" sm="9" xl="10">
        <LocalizedFieldRow
          name={`${name}.question`}
          localizedName={`${name}.languages.{}.question`}
          defaultAsPlaceholder
          type="text"
          label={t("editor.questions.questionText")}
          required
          maxLength={255}
          formatError={formatError}
        />
        <FieldRow
          name={`${name}.type`}
          label={t("editor.questions.questionType")}
          as={SelectBox}
          required
          options={[
            [QuestionType.TEXT, t("editor.questions.questionType.text")],
            [QuestionType.TEXT_AREA, t("editor.questions.questionType.textarea")],
            [QuestionType.NUMBER, t("editor.questions.questionType.number")],
            [QuestionType.SELECT, t("editor.questions.questionType.select")],
            [QuestionType.CHECKBOX, t("editor.questions.questionType.checkbox")],
          ]}
          formatError={formatError}
        />
        {(type === "select" || type === "checkbox") && (
          <FieldArray name={`${name}.options`}>
            {({ fields }) => (
              <>
                {fields.map((optName, i) => (
                  <OptionRow key={optName} name={optName} index={i} remove={fields.remove} />
                ))}
                {fields.value.length < maxOptionsPerQuestion && (
                  <Row>
                    <Col sm="3" />
                    <Col sm="9">
                      <Button variant="secondary" type="button" onClick={addOption}>
                        {t("editor.questions.questionOptions.add")}
                      </Button>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </FieldArray>
        )}
      </Col>
      <Col xs="12" sm="3" xl="2" className="event-editor--question-buttons">
        <Field
          name={`${name}.required`}
          type="checkbox"
          id={`${name}.required`}
          label={t("editor.questions.questionRequired")}
          className="mb-3"
        >
          {renderCheck}
        </Field>
        <Field
          name={`${name}.public`}
          type="checkbox"
          id={`${name}.public`}
          label={t("editor.questions.questionPublic")}
          className="mb-3"
        >
          {renderCheck}
        </Field>
        <Button variant="danger" type="button" onClick={removeThis}>
          {t("editor.questions.deleteQuestion")}
        </Button>
      </Col>
    </Row>
  );
};

const Questions = () => {
  const { t } = useTranslation();
  const { fields } = useFieldArray<EditorQuestion>("questions");
  const languages = useFieldValue<EditorEvent["languages"]>("languages");

  const addQuestion = useEvent(() => {
    fields.push({
      key: `new-${Math.random()}`,
      required: false,
      public: false,
      question: "",
      type: QuestionType.TEXT,
      options: [""],
      languages: mapValues(languages, () => ({})),
    });
  });

  const updateOrder = useEvent(({ newIndex, oldIndex }: SortEnd) => fields.move(oldIndex, newIndex));

  const keys = useShallowMemo(fields.value.map((item) => item.key));
  const questionItems = useMemo(
    () => fields.map((name, i) => <QuestionRow key={keys[i]} name={name} index={i} remove={fields.remove} />),
    // This list only invalidates when the question positions or count change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keys],
  );

  return (
    <>
      <Sortable collection="questions" items={questionItems} onSortEnd={updateOrder} useDragHandle />
      <div className="text-center mb-3">
        <Button type="button" variant="primary" onClick={addQuestion}>
          {t("editor.questions.addQuestion")}
        </Button>
      </div>
    </>
  );
};

export default Questions;
