import { ApiError } from '@tietokilta/ilmomasiina-components';
import type { AdminEventListResponse } from '@tietokilta/ilmomasiina-models';

export interface AdminState {
  events: AdminEventListResponse | null;
  loadError?: ApiError;
}

export type { AdminEventsActions } from './actions';
