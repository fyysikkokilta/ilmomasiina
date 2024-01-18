import React, { ComponentType, ReactNode } from 'react';

import { Field, useField } from 'formik';
import { Form } from 'react-bootstrap';

import BaseFieldRow, { BaseFieldRowProps } from '../BaseFieldRow';

type Props = Omit<BaseFieldRowProps, 'error' | 'children'> & {
  /** Overrides the real error message if the field has errors. */
  alternateError?: string;
  /** Passed as `label` to the field component. Intended for checkboxes. */
  checkLabel?: ReactNode;
  /** The component or element to use as the field. */
  as?: ComponentType<any> | string;
  /** useField() config. */
  config?: UseFieldConfig<any>;
  /** If given, this is used as the field. */
  children?: ReactNode;
};

/** FieldRow for use with formik */
export default function FieldRow<P = unknown>({
  name,
  label = '',
  help,
  required = false,
  alternateError,
  extraFeedback,
  checkAlign,
  checkLabel,
  as: Component = Form.Control,
  children,
  type,
  id,
  controlId = id,
  config,
  ...props
}: Props & P) {
  const [, { error }] = useField<any>(name);

  let field: ReactNode;
  if (children) {
    field = children;
  } else {
    // Checkboxes have two labels: in the left column and next to the checkbox. Form.Check handles the latter for us
    // and calls it "label", but we still want to call the other one "label" for all other types of field. Therefore
    // we pass "checkLabel" to the field here.
    const overrideProps = checkLabel !== undefined ? { label: checkLabel } : {};
    field = <Field as={as} name={name} required={required} {...props} {...overrideProps} />;
  }

  return (
    <BaseFieldRow
      name={name}
      label={label}
      help={help}
      required={required}
      error={error && (alternateError || error)}
      extraFeedback={extraFeedback}
      checkAlign={checkAlign}
    >
      {field}
    </BaseFieldRow>
  );
}
