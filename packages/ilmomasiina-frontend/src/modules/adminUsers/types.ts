import { ApiError } from '@tietokilta/ilmomasiina-components';
import type { UserListResponse } from '@tietokilta/ilmomasiina-models';

export interface AdminUsersState {
  users: UserListResponse | null;
  loadError?: ApiError;
}

export type { AdminUsersActions } from './actions';
