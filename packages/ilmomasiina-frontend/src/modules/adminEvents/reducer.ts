import {
  EVENTS_LOAD_FAILED,
  EVENTS_LOADED,
  RESET,
} from './actionTypes';
import type { AdminEventsActions, AdminState } from './types';

const initialState: AdminState = {
  events: null,
};

export default function reducer(
  state = initialState,
  action: AdminEventsActions,
): AdminState {
  switch (action.type) {
    case EVENTS_LOADED:
      return {
        ...state,
        events: action.payload,
        loadError: undefined,
      };
    case EVENTS_LOAD_FAILED:
      return {
        ...state,
        loadError: action.payload,
      };
    case RESET:
      return initialState;
    default:
      return state;
  }
}
