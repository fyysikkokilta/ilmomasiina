import React, { ReactNode } from "react";

import { Col, Form, Row } from "react-bootstrap";

export type BaseFieldRowProps = {
  /** Passed to the `FormGroup`. */
  controlId?: string;
  /** The label placed in the left column. */
  label?: string;
  /** The help string placed below the field. */
  help?: ReactNode;
  /** Whether the field is required. */
  required?: boolean;
  /** Error message rendered below the field. */
  error?: ReactNode;
  /** Extra feedback rendered below the field. Bring your own `Form.Control.Feedback`. */
  extraFeedback?: ReactNode;
  /** `true` to adjust the vertical alignment of the left column label for checkboxes/radios. */
  checkAlign?: boolean;
  children: ReactNode;
};

/** Form library agnostic field row component */
export default function BaseFieldRow({
  controlId,
  label = "",
  help,
  required = false,
  extraFeedback,
  checkAlign,
  children,
  error,
}: BaseFieldRowProps) {
  return (
    <Form.Group as={Row} controlId={controlId}>
      <Col sm="3" className="ilmo--label-column">
        <Form.Label data-required={required} className={`col-form-label ${checkAlign ? "pt-0" : ""}`}>
          {label}
        </Form.Label>
      </Col>
      <Col sm="9">
        {children}
        {error && (
          // Use text-danger instead of invalid-feedback here. invalid-feedback is hidden automatically when the
          // previous element isn't .is-invalid, but that doesn't work with checkbox arrays.
          <Form.Text className="text-danger">{error}</Form.Text>
        )}
        {extraFeedback}
        {help && <Form.Text muted>{help}</Form.Text>}
      </Col>
    </Form.Group>
  );
}
