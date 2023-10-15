import type { ApiError } from '@tietokilta/ilmomasiina-components';
import type { AuditLogResponse, AuditLoqQuery } from '@tietokilta/ilmomasiina-models';

export interface AuditLogState {
  query: AuditLoqQuery;
  auditLog: AuditLogResponse | null;
  loadError?: ApiError;
}

export type { AuditLogActions } from './actions';
