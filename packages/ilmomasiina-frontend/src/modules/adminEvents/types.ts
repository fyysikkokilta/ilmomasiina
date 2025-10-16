import { ApiError } from "@tietokilta/ilmomasiina-client";
import type { AdminEventListResponse } from "@tietokilta/ilmomasiina-models";

export interface AdminState {
  events: AdminEventListResponse | null;
  loadError?: ApiError;
}

export type { AdminEventsActions } from "./actions";
