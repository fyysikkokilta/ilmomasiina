import { ApiError } from "@tietokilta/ilmomasiina-client";
import type { AdminEventListResponse, EventID } from "@tietokilta/ilmomasiina-models";
import adminApiFetch from "../../api";
import storeSlice from "../../utils/storeSlice";
import type { Root } from "../store";

export interface AdminEventsState {
  events: AdminEventListResponse | null;
  loadError?: ApiError;
}

const initialState: AdminEventsState = {
  events: null,
};

export type AdminEventsSlice = AdminEventsState & {
  resetState: () => void;
  getAdminEvents: () => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
};

export const adminEventsSlice = storeSlice<Root>()(
  "adminEvents",
  (set, get, store, getSlice, setSlice, resetState) => ({
    ...initialState,
    resetState,

    getAdminEvents: async () => {
      try {
        const { accessToken } = get().auth;
        const response = await adminApiFetch<AdminEventListResponse>("admin/events", { accessToken });
        setSlice({ events: response, loadError: undefined });
      } catch (e) {
        setSlice({ events: null, loadError: e as ApiError });
      }
    },

    deleteEvent: async (id: EventID) => {
      const { accessToken } = get().auth;
      await adminApiFetch(`admin/events/${id}`, {
        accessToken,
        method: "DELETE",
      });
    },
  }),
);
