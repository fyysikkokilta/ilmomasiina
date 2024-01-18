import React from 'react';

import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import useEvent from '@tietokilta/ilmomasiina-components/dist/utils/useEvent';
import { moveToQueueCanceled } from '../../../modules/editor/actions';
import { useTypedDispatch, useTypedSelector } from '../../../store/reducers';

type Props = {
  onProceed: () => void;
};

const MoveToQueueWarning = ({ onProceed }: Props) => {
  const dispatch = useTypedDispatch();
  const modal = useTypedSelector((state) => state.editor.moveToQueueModal);
  const { t } = useTranslation();

  const proceed = useEvent(() => {
    dispatch(moveToQueueCanceled());
    onProceed();
  });
  const cancel = useEvent(() => dispatch(moveToQueueCanceled()));

  return (
    <Modal show={!!modal} onHide={cancel}>
      <Modal.Header>
        <Modal.Title>{t('editor.moveToQueue.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('editor.moveToQueue.info1', { number: modal?.count || '?' })}</p>
        <p>{t('editor.moveToQueue.info2')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="muted" onClick={cancel}>
          {t('editor.moveToQueue.action.cancel')}
        </Button>
        <Button variant="danger" onClick={proceed}>
          {t('editor.moveToQueue.action.proceed')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MoveToQueueWarning;
