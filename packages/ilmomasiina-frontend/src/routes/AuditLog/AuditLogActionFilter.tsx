import React from 'react';

import { Form } from 'react-bootstrap';

import { AuditEvent } from '@tietokilta/ilmomasiina-models';
import { setAuditLogQueryField } from '../../modules/auditLog/actions';
import { useTypedDispatch } from '../../store/reducers';

const ACTIONS = [
  [AuditEvent.CREATE_EVENT, 'Tapahtuma: Luo'],
  [AuditEvent.EDIT_EVENT, 'Tapahtuma: Muokkaa'],
  [AuditEvent.PUBLISH_EVENT, 'Tapahtuma: Julkaise'],
  [AuditEvent.UNPUBLISH_EVENT, 'Tapahtuma: Luonnokseksi'],
  [AuditEvent.DELETE_EVENT, 'Tapahtuma: Poista'],
  [AuditEvent.EDIT_SIGNUP, 'Ilmoittautuminen: Muokkaa'],
  [AuditEvent.DELETE_SIGNUP, 'Ilmoittautuminen: Poista'],
  [AuditEvent.PROMOTE_SIGNUP, 'Ilmoittautuminen: Nousi jonosta'],
  [AuditEvent.CREATE_USER, 'Käyttäjä: Luo'],
  [AuditEvent.DELETE_USER, 'Käyttäjä: Poista'],
];

const AuditLogActionFilter = () => {
  const dispatch = useTypedDispatch();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Since e.target.value comes from the <select> below, we can assume the type
    const event = e.target.value ? [e.target.value as AuditEvent] : undefined;
    dispatch(setAuditLogQueryField('action', event));
  };

  return (
    <Form.Control
      as="select"
      onChange={onChange}
    >
      <option value="">Toiminto&hellip;</option>
      {ACTIONS.map(([key, label]) => (
        <option value={key} key={key}>{label}</option>
      ))}
    </Form.Control>
  );
};

export default AuditLogActionFilter;
