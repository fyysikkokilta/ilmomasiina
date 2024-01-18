import { RESET, USERS_LOAD_FAILED, USERS_LOADED } from './actionTypes';
import type { AdminUsersActions, AdminUsersState } from './types';

const initialState: AdminUsersState = {
  users: null,
};

export default function reducer(
  state = initialState,
  action: AdminUsersActions,
): AdminUsersState {
  switch (action.type) {
    case USERS_LOADED:
      return {
        ...state,
        users: action.payload,
        loadError: undefined,
      };
    case USERS_LOAD_FAILED:
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
