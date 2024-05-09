import React, { ChangeEvent } from 'react';

import { Button, Form } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';

import useEvent from '@tietokilta/ilmomasiina-components/dist/utils/useEvent';
import { setAuditLogQueryField } from '../../modules/auditLog/actions';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';

export const LOGS_PER_PAGE = 100;

const AuditLogPagination = () => {
  const { query, auditLog } = useTypedSelector((state) => state.auditLog);
  const dispatch = useTypedDispatch();
  const { t } = useTranslation();

  const value = query.offset || 0;
  const perPage = query.limit || LOGS_PER_PAGE;

  const previousPage = useEvent(() => {
    dispatch(setAuditLogQueryField('offset', Math.max(0, value - perPage)));
  });
  const nextPage = useEvent(() => {
    dispatch(setAuditLogQueryField('offset', value + perPage));
  });
  const onOffsetChange = useEvent((e: ChangeEvent<HTMLSelectElement>) => {
    const newOffset = Number(e.target.value) - 1;
    if (newOffset >= 0) dispatch(setAuditLogQueryField('offset', newOffset));
  });

  return (
    <nav className="audit-log--pagination mb-3">
      <Button
        className="mr-3"
        type="button"
        onClick={previousPage}
        aria-label={t('auditLog.pagination.previous')}
        disabled={value <= 0}
      >
        &laquo;
      </Button>
      <Trans t={t} i18nKey="auditLog.pagination">
        {'Rows\u00A0'}
        <Form.Control
          type="number"
          value={value + 1}
          onChange={onOffsetChange}
        />
        &ndash;
        {{ last: value + LOGS_PER_PAGE }}
        {' out of '}
        {{ total: auditLog?.count || '?' }}
      </Trans>
      <Button
        className="ml-3"
        type="button"
        onClick={nextPage}
        aria-label={t('auditLog.pagination.next')}
        disabled={!auditLog || value + perPage >= auditLog.count}
      >
        &raquo;
      </Button>
    </nav>
  );
};

export default AuditLogPagination;
