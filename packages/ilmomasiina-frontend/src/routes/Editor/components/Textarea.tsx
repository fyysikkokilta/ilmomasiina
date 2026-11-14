import React, { TextareaHTMLAttributes } from "react";

import { Form, FormControlProps } from "react-bootstrap";

const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- react-bootstrap's polymorphic `as` typing can't express this
  const controlProps = props as FormControlProps;
  return <Form.Control as="textarea" {...controlProps} />;
};

export default Textarea;
