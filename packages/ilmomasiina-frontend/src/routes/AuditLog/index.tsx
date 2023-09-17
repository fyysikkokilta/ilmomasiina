import React, { useEffect } from 'react';

import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';

import requireAuth from '../../containers/requireAuth';
import { getAuditLogs, resetState } from '../../modules/auditLog/actions';
import appPaths from '../../paths';
import { useTypedDispatch, useTypedSelector } from '../../store/reducers';
import AuditLogActionFilter from './AuditLogActionFilter';
import AuditLogFilter from './AuditLogFilter';
import AuditLogItem from './AuditLogItem';
import AuditLogPagination, { LOGS_PER_PAGE } from './AuditLogPagination';

import './AuditLog.scss';

const AuditLog = () => {
  const dispatch = useTypedDispatch();
  const { auditLog, auditLogLoadError } = useTypedSelector((state) => state.auditLog, shallowEqual);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getAuditLogs({
      limit: LOGS_PER_PAGE,
    }));
    return () => {
      resetState();
    };
  }, [dispatch]);

  return (
    <>
      <Link to={appPaths.adminEventsList}>
        &#8592;
        {' '}
        {t('auditLog.returnToEvents')}
      </Link>
      <h1>{t('auditLog.title')}</h1>
      <AuditLogPagination />
      <table className="table audit-log--table">
        <thead>
          <tr>
            <th>
              {t('auditLog.column.time')}
            </th>
            <th>
              {t('auditLog.column.user')}
              <nav className="audit-log--filter">
                <AuditLogFilter name="user" />
              </nav>
            </th>
            <th>
              {t('auditLog.column.ipAddress')}
              <nav className="audit-log--filter">
                <AuditLogFilter name="ip" />
              </nav>
            </th>
            <th>
              {t('auditLog.column.action')}
              <nav className="audit-log--filter">
                <AuditLogActionFilter />
                <AuditLogFilter name="event" placeholder={t('auditLog.filter.event')} />
                <AuditLogFilter name="signup" placeholder={t('auditLog.filter.signup')} />
              </nav>
            </th>
          </tr>
        </thead>
        <tbody>
          {auditLogLoadError && (
            <tr>
              <td colSpan={4}>
                {t('auditLog.loadFailed')}
              </td>
            </tr>
          )}
          {!auditLogLoadError && !auditLog && (
            <tr>
              <td colSpan={4}>
                <Spinner animation="border" />
              </td>
            </tr>
          )}
          {auditLog && auditLog.rows.map((item) => (
            <AuditLogItem
              key={item.id}
              item={item}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default requireAuth(AuditLog);
