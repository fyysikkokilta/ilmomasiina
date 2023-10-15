import {
  AUDIT_LOG_LOAD_FAILED,
  AUDIT_LOG_LOADED,
  AUDIT_LOG_QUERY,
  RESET,
} from './actionTypes';
import type { AuditLogActions, AuditLogState } from './types';

const initialState: AuditLogState = {
  query: {},
  auditLog: null,
};

export default function reducer(
  state = initialState,
  action: AuditLogActions,
): AuditLogState {
  switch (action.type) {
    case AUDIT_LOG_QUERY:
      return {
        ...state,
        query: action.payload,
        auditLog: null,
        loadError: undefined,
      };
    case AUDIT_LOG_LOADED:
      return {
        ...state,
        auditLog: action.payload,
        loadError: undefined,
      };
    case AUDIT_LOG_LOAD_FAILED:
      return {
        ...state,
        auditLog: null,
        loadError: action.payload,
      };
    case RESET:
      return initialState;
    default:
      return state;
  }
}
