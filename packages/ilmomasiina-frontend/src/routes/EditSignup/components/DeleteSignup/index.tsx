import React, { useEffect, useState } from 'react';

import { Col, Row } from 'react-bootstrap';
import { shallowEqual } from 'react-redux';

import { deleteSignup } from '../../../../modules/editSignup/actions';
import { useTypedDispatch, useTypedSelector } from '../../../../store/reducers';

const DELETE_CONFIRM_MS = 4000;

type Props = {
  editToken: string;
};

const DeleteSignup = ({ editToken }: Props) => {
  const dispatch = useTypedDispatch();
  const { event, signup, submitting } = useTypedSelector((state) => state.editSignup, shallowEqual);

  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), DELETE_CONFIRM_MS);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [confirming]);

  function onDeleteClick() {
    if (confirming) {
      setConfirming(false);
      dispatch(deleteSignup(signup!.id, editToken));
    } else {
      setConfirming(true);
    }
  }

  return (
    <Row className="justify-content-md-center text-center my-5">
      <Col xs="12" md="10" lg="8">
        <h2>Poista ilmoittautuminen</h2>
        <p>
          Oletko varma, että haluat poistaa ilmoittautumisesi tapahtumaan
          {' '}
          <strong>
            {event!.title}
          </strong>
          ?
        </p>
        <p>
          Jos poistat ilmoittautumisesi, menetät paikkasi jonossa. Jos
          muutat mielesi, voit aina ilmoittautua tapahtumaan uudelleen
          myöhemmin, mutta siirryt silloin jonon hännille.
          {' '}
          <strong>Tätä toimintoa ei voi perua.</strong>
        </p>
        <button type="button" disabled={submitting} onClick={onDeleteClick} className="btn btn-danger">
          {confirming ? 'Paina uudelleen varmistukseksi\u2026' : 'Poista ilmoittautuminen'}
        </button>
      </Col>
    </Row>
  );
};

export default DeleteSignup;
