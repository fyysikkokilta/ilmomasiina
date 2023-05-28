import React from 'react';

import { Form, InputGroup } from 'react-bootstrap';

import appPaths, { urlPrefix } from '../../../paths';

export default (props: any) => {
  const domain = /^https?:\/\//.test(urlPrefix) ? urlPrefix.replace(/^https?:\/\//, '') : window.location.host;
  const prefix = domain + appPaths.eventDetails('');
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>{prefix}</InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Control {...props} />
    </InputGroup>
  );
};
