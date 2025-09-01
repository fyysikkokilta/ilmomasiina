import { ApiError } from "@tietokilta/ilmomasiina-client";
import type { UserListResponse } from "@tietokilta/ilmomasiina-models";

export interface AdminUsersState {
  users: UserListResponse | null;
  loadError?: ApiError;
}

export type { AdminUsersActions } from "./actions";
