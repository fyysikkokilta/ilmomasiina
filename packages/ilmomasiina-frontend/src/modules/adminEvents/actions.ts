import type { ApiError } from '@tietokilta/ilmomasiina-components';
import type { AdminEventListResponse, EventID } from '@tietokilta/ilmomasiina-models';
import adminApiFetch from '../../api';
import type { DispatchAction, GetState } from '../../store/types';
import {
  EVENTS_LOAD_FAILED,
  EVENTS_LOADED,
  RESET,
} from './actionTypes';

export const resetState = () => <const>{
  type: RESET,
};

export const eventsLoaded = (events: AdminEventListResponse) => <const>{
  type: EVENTS_LOADED,
  payload: events,
};

export const eventsLoadFailed = (error: ApiError) => <const>{
  type: EVENTS_LOAD_FAILED,
  payload: error,
};

export type AdminEventsActions =
  | ReturnType<typeof eventsLoaded>
  | ReturnType<typeof eventsLoadFailed>
  | ReturnType<typeof resetState>;

export const getAdminEvents = () => async (dispatch: DispatchAction, getState: GetState) => {
  try {
    const { accessToken } = getState().auth;
    const response = await adminApiFetch('admin/events', { accessToken }, dispatch);
    dispatch(eventsLoaded(response as AdminEventListResponse));
  } catch (e) {
    dispatch(eventsLoadFailed(e as ApiError));
  }
};

export const deleteEvent = (id: EventID) => async (dispatch: DispatchAction, getState: GetState) => {
  const { accessToken } = getState().auth;
  await adminApiFetch(`admin/events/${id}`, {
    accessToken,
    method: 'DELETE',
  }, dispatch);
};
