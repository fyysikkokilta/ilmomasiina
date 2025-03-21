import React, { ComponentPropsWithoutRef } from "react";

import { Form, FormControlProps, InputGroup } from "react-bootstrap";

import appPaths, { urlPrefix } from "../../../paths";

export default (props: FormControlProps & ComponentPropsWithoutRef<"input">) => {
  const domain = /^https?:\/\//.test(urlPrefix) ? urlPrefix.replace(/^https?:\/\//, "") : window.location.host;
  const prefix = domain + appPaths.eventDetails("");
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>{prefix}</InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Control {...props} />
    </InputGroup>
  );
};
