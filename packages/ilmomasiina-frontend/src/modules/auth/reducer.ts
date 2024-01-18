import moment, { Moment } from 'moment';

import { LOGIN_SUCCEEDED, RESET } from './actionTypes';
import type { AuthActions, AuthState } from './types';

const initialState: AuthState = {
  accessToken: undefined,
  accessTokenExpires: undefined,
  loggedIn: false,
};

function getTokenExpiry(jwt: string): Moment {
  const parts = jwt.split('.');

  try {
    const payload = JSON.parse(window.atob(parts[1]));

    if (payload.exp) {
      return moment.unix(payload.exp);
    }
  } catch {
    // eslint-disable-next-line no-console
    console.error('Invalid jwt token received!');
  }

  return moment();
}

export default function reducer(
  state = initialState,
  action: AuthActions,
): AuthState {
  switch (action.type) {
    case RESET:
      return initialState;
    case LOGIN_SUCCEEDED:
      return {
        accessToken: action.payload.accessToken,
        accessTokenExpires: getTokenExpiry(action.payload.accessToken).toISOString(),
        loggedIn: true,
      };
    default:
      return state;
  }
}
